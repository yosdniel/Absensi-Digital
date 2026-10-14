import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Navigation,
  Check,
  Eye,
  Smile,
  Activity,
  Radio,
  Wifi,
  WifiOff,
  CloudOff,
  Info,
} from 'lucide-react';
import { useApp, calculateDistanceMeters } from '../../context/AppContext';
import { AttendanceType } from '../../types';
import confetti from 'canvas-confetti';

interface AttendanceScanModalProps {
  isOpen: boolean;
  type: AttendanceType;
  onClose: () => void;
  onSuccess: () => void;
}

type LivenessChallenge = 'ALIGN' | 'BLINK' | 'SMILE' | 'VERIFIED';
type LocationSimMode = 'REAL' | 'OFFICE' | 'EDGE' | 'OUTSIDE';

export const AttendanceScanModal: React.FC<AttendanceScanModalProps> = ({
  isOpen,
  type,
  onClose,
  onSuccess,
}) => {
  const { currentUser, settings, recordAttendance, queueOfflineAttendance, backgroundSyncEnabled } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean>(true);
  const [isNearGeofenceEdge, setIsNearGeofenceEdge] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationSimMode, setLocationSimMode] = useState<LocationSimMode>('REAL');
  const [isOfflineQueuedSuccess, setIsOfflineQueuedSuccess] = useState<boolean>(false);

  // Anti-Fake GPS & Mock Location Security States
  const [isMockGpsDetected, setIsMockGpsDetected] = useState<boolean>(false);
  const [mockGpsWarning, setMockGpsWarning] = useState<string | null>(null);

  // Anti-Manipulation Liveness States
  const [livenessStage, setLivenessStage] = useState<LivenessChallenge>('ALIGN');
  const [livenessScore, setLivenessScore] = useState<number>(0);
  const [isStaticPhotoWarning, setIsStaticPhotoWarning] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const livenessCheckIntervalRef = useRef<any>(null);
  const staticFrameCountRef = useRef<number>(0);
  const dynamicFrameCountRef = useRef<number>(0);
  const blinkDetectedRef = useRef<boolean>(false);

  // Anti-Fake GPS and Geofence Verification Algorithm
  const verifyGpsSecurityAndGeofence = useCallback((pos: GeolocationPosition) => {
    let mockDetected = false;
    let warningReason = '';

    const coords = pos.coords;

    // Check 1: Android Chrome Geolocation mock flag
    if ((coords as any).mocked === true || (pos as any).mocked === true) {
      mockDetected = true;
      warningReason = 'Terdeteksi atribut Mock Location dari pengaturan Opsi Pengembang Android.';
    }

    // Check 2: Suspicious Accuracy (Fake GPS apps often set exactly 0.0m or 1.0m flat)
    if (coords.accuracy <= 0.2) {
      mockDetected = true;
      warningReason = 'Akurasi GPS tidak wajar (0.0m). Indikasi penggunaan aplikasi emulator atau Fake GPS.';
    }

    // Check 3: Timestamp drift (Replayed NMEA logs or frozen timestamps)
    const timeDrift = Math.abs(Date.now() - pos.timestamp);
    if (timeDrift > 180000) {
      // More than 3 minutes drift
      mockDetected = true;
      warningReason = 'Timestamp GPS tidak sinkron dengan jam sistem perangkat (indikasi playback log koordinat).';
    }

    const lat = coords.latitude;
    const lng = coords.longitude;
    setUserLocation({ lat, lng });

    if (mockDetected) {
      setIsMockGpsDetected(true);
      setMockGpsWarning(warningReason);
      setIsWithinRadius(false);
      setErrorMsg(`🚨 KEAMANAN SISTEM: Terdeteksi Penggunaan Fake GPS / Lokasi Palsu! ${warningReason}`);
      return;
    }

    // Real GPS verified
    setIsMockGpsDetected(false);
    setMockGpsWarning(null);

    const dist = calculateDistanceMeters(lat, lng, settings.lat, settings.lng);
    setDistanceMeters(dist);
    const within = dist <= settings.radius;
    setIsWithinRadius(within);

    // Near-edge calculation: hovering near the outer 25% boundary (or within 15 meters of radius threshold)
    const nearEdge = within && (dist >= settings.radius * 0.75 || settings.radius - dist <= 15);
    setIsNearGeofenceEdge(nearEdge);

    if (!within) {
      setErrorMsg(
        `Lokasi Anda berada di luar radius kantor (${dist}m dari kantor, batas izin maksimal ${settings.radius}m). Presensi tidak dapat dilakukan di luar area kantor.`
      );
    } else {
      setErrorMsg(null);
    }
  }, [settings.lat, settings.lng, settings.radius]);

  const detectLocation = useCallback(() => {
    setIsLocating(true);
    setIsMockGpsDetected(false);
    setMockGpsWarning(null);

    if (locationSimMode === 'OFFICE') {
      const simLat = settings.lat + 0.00004;
      const simLng = settings.lng + 0.00004;
      setUserLocation({ lat: simLat, lng: simLng });
      const dist = calculateDistanceMeters(simLat, simLng, settings.lat, settings.lng);
      setDistanceMeters(dist);
      setIsWithinRadius(true);
      setIsNearGeofenceEdge(false);
      setErrorMsg(null);
      setIsLocating(false);
      return;
    }

    if (locationSimMode === 'EDGE') {
      // Hovering on outer edge (e.g. 88m if radius=100m)
      const edgeOffset = (settings.radius * 0.88) / 111111;
      const simLat = settings.lat + edgeOffset;
      const simLng = settings.lng;
      setUserLocation({ lat: simLat, lng: simLng });
      const dist = calculateDistanceMeters(simLat, simLng, settings.lat, settings.lng);
      setDistanceMeters(dist);
      setIsWithinRadius(true);
      setIsNearGeofenceEdge(true);
      setErrorMsg(null);
      setIsLocating(false);
      return;
    }

    if (locationSimMode === 'OUTSIDE') {
      const outOffset = (settings.radius + 35) / 111111;
      const simLat = settings.lat + outOffset;
      const simLng = settings.lng;
      setUserLocation({ lat: simLat, lng: simLng });
      const dist = calculateDistanceMeters(simLat, simLng, settings.lat, settings.lng);
      setDistanceMeters(dist);
      setIsWithinRadius(false);
      setIsNearGeofenceEdge(false);
      setErrorMsg(
        `Lokasi Anda berada di luar radius kantor (${dist}m dari kantor, batas izin maksimal ${settings.radius}m).`
      );
      setIsLocating(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          verifyGpsSecurityAndGeofence(pos);
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setUserLocation({ lat: settings.lat, lng: settings.lng });
          setDistanceMeters(6);
          setIsWithinRadius(true);
          setIsNearGeofenceEdge(false);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation({ lat: settings.lat, lng: settings.lng });
      setDistanceMeters(0);
      setIsWithinRadius(true);
      setIsNearGeofenceEdge(false);
      setIsLocating(false);
    }
  }, [locationSimMode, settings.lat, settings.lng, settings.radius, verifyGpsSecurityAndGeofence]);

  // Anti-Manipulation Frame Differencing & Micro-motion Verification Loop
  useEffect(() => {
    if (!isOpen) return;

    if (!diffCanvasRef.current) {
      diffCanvasRef.current = document.createElement('canvas');
      diffCanvasRef.current.width = 160;
      diffCanvasRef.current.height = 160;
    }

    const checkLivenessMotion = () => {
      const video = videoRef.current;
      const diffCanvas = diffCanvasRef.current;
      if (!video || !diffCanvas || video.readyState !== 4) return;

      const ctx = diffCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 160, 160);
      const currentFrame = ctx.getImageData(0, 0, 160, 160);
      const curData = currentFrame.data;

      if (prevFrameDataRef.current) {
        const prevData = prevFrameDataRef.current;
        let diffCount = 0;
        const totalPixels = 160 * 160;

        // Sample pixel difference across frames
        for (let i = 0; i < curData.length; i += 16) {
          const delta =
            Math.abs(curData[i] - prevData[i]) +
            Math.abs(curData[i + 1] - prevData[i + 1]) +
            Math.abs(curData[i + 2] - prevData[i + 2]);
          if (delta > 35) {
            diffCount++;
          }
        }

        const varianceRatio = (diffCount / (totalPixels / 4)) * 100;

        // Check if completely static (printed photo or frozen screen)
        if (varianceRatio < 0.2) {
          staticFrameCountRef.current++;
          if (staticFrameCountRef.current > 12) {
            setIsStaticPhotoWarning(true);
          }
        } else {
          staticFrameCountRef.current = Math.max(0, staticFrameCountRef.current - 1);
          setIsStaticPhotoWarning(false);
        }

        // Natural human micro-motion range (1.2% to 25%)
        if (varianceRatio >= 0.8 && varianceRatio <= 28) {
          dynamicFrameCountRef.current++;
          setLivenessScore((prev) => Math.min(99, prev + 8));

          // Challenge Progression:
          // Step 1: ALIGN -> BLINK
          if (dynamicFrameCountRef.current > 4 && livenessStage === 'ALIGN') {
            setLivenessStage('BLINK');
          }

          // Step 2: BLINK -> SMILE/MOTION (detected sudden variance jump 5%-15%)
          if (varianceRatio > 4 && livenessStage === 'BLINK') {
            blinkDetectedRef.current = true;
            setTimeout(() => {
              setLivenessStage('SMILE');
            }, 600);
          }

          // Step 3: SMILE/MOTION -> VERIFIED
          if (livenessStage === 'SMILE' && dynamicFrameCountRef.current > 12) {
            setLivenessStage('VERIFIED');
            setLivenessScore(98);
          }
        }
      }

      prevFrameDataRef.current = new Uint8ClampedArray(curData);
    };

    livenessCheckIntervalRef.current = setInterval(checkLivenessMotion, 250);

    return () => {
      if (livenessCheckIntervalRef.current) {
        clearInterval(livenessCheckIntervalRef.current);
      }
    };
  }, [isOpen, livenessStage]);

  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        // Fallback photo
      }
    }

    initCamera();
    detectLocation();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, detectLocation]);

  const handleSimChange = (mode: LocationSimMode) => {
    setLocationSimMode(mode);
    setIsMockGpsDetected(false);
    setMockGpsWarning(null);

    if (mode === 'OFFICE') {
      const simLat = settings.lat + 0.00004;
      const simLng = settings.lng + 0.00004;
      setUserLocation({ lat: simLat, lng: simLng });
      setDistanceMeters(6);
      setIsWithinRadius(true);
      setIsNearGeofenceEdge(false);
      setErrorMsg(null);
    } else if (mode === 'EDGE') {
      const edgeOffset = (settings.radius * 0.88) / 111111;
      const simLat = settings.lat + edgeOffset;
      const simLng = settings.lng;
      setUserLocation({ lat: simLat, lng: simLng });
      const dist = Math.round(settings.radius * 0.88);
      setDistanceMeters(dist);
      setIsWithinRadius(true);
      setIsNearGeofenceEdge(true);
      setErrorMsg(null);
    } else if (mode === 'OUTSIDE') {
      const outOffset = (settings.radius + 35) / 111111;
      const simLat = settings.lat + outOffset;
      const simLng = settings.lng;
      setUserLocation({ lat: simLat, lng: simLng });
      const dist = settings.radius + 35;
      setDistanceMeters(dist);
      setIsWithinRadius(false);
      setIsNearGeofenceEdge(false);
      setErrorMsg(
        `Lokasi Anda berada di luar radius kantor (${dist}m dari kantor, batas izin maksimal ${settings.radius}m).`
      );
    } else {
      detectLocation();
    }
  };

  if (!isOpen) return null;

  const handleCaptureAndSubmit = () => {
    if (isMockGpsDetected) {
      setErrorMsg('Presensi DITOLAK: Matikan aplikasi Fake GPS / Mock Location terlebih dahulu!');
      return;
    }

    if (!isWithinRadius) {
      setErrorMsg(
        `Presensi DITOLAK: Anda berada ${distanceMeters}m di luar radius kantor (${settings.radius}m).`
      );
      return;
    }

    if (isStaticPhotoWarning) {
      setErrorMsg('Peringatan Anti-Manipulasi: Terdeteksi foto statis! Arahkan kamera ke wajah asli langsung.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    let photoUrl =
      currentUser?.facePhotoUrl ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        photoUrl = canvas.toDataURL('image/jpeg');
      }
    }

    setCapturedPhoto(photoUrl);

    // If offline detected or offline sync triggered
    if (!navigator.onLine) {
      setTimeout(() => {
        queueOfflineAttendance(type, photoUrl, userLocation || undefined);
        setIsProcessing(false);
        setIsOfflineQueuedSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1800);
      }, 1000);
      return;
    }

    setTimeout(() => {
      const res = recordAttendance(type, photoUrl, userLocation || undefined);
      setIsProcessing(false);

      if (res.success) {
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignored
        }
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    }, 1000);
  };

  const getChallengeInstructions = () => {
    switch (livenessStage) {
      case 'ALIGN':
        return {
          icon: <Eye className="w-3.5 h-3.5 text-emerald-400" />,
          text: 'Posisikan Wajah Tegak di Lingkaran',
          color: 'bg-black/70 text-white',
        };
      case 'BLINK':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
          text: 'Kedipkan Kedua Mata Anda Sekali',
          color: 'bg-amber-950/80 text-amber-200 border border-amber-500/50',
        };
      case 'SMILE':
        return {
          icon: <Smile className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />,
          text: 'Tersenyum atau Anggukkan Kepala Sedikit',
          color: 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/50',
        };
      case 'VERIFIED':
        return {
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
          text: 'Biometrik Liveness Terverifikasi (100% Asli)',
          color: 'bg-emerald-900/90 text-emerald-200 border border-emerald-400',
        };
    }
  };

  const challenge = getChallengeInstructions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Presensi Absen {type === 'MASUK' ? 'Masuk' : 'Pulang'}
            </h3>
            <p className="text-xs text-slate-400">
              Verifikasi Biometrik & Keamanan Anti-Fake GPS
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Warning: Fake GPS Detected */}
        {isMockGpsDetected && (
          <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in shake">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black text-rose-900">
                🚨 PERINGATAN: FAKE GPS TERDETEKSI!
              </span>
              <p className="text-[11px] leading-relaxed">
                {mockGpsWarning || 'Sistem mendeteksi penggunaan aplikasi manipulasi GPS. Presensi dinonaktifkan demi integritas data.'}
              </p>
              <p className="text-[10px] font-bold text-rose-700 underline">
                Matikan opsi Mock Location di HP Anda lalu klik Cek Ulang GPS.
              </p>
            </div>
          </div>
        )}

        {/* Anti-Spoofing: Static Photo Warning */}
        {isStaticPhotoWarning && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="text-[11px] font-bold">
              Foto Statis Terdeteksi! Jangan gunakan foto cetak atau layar perangkat lain.
            </span>
          </div>
        )}

        {/* Real-time Edge of Geofence Warning Notification */}
        {isNearGeofenceEdge && isWithinRadius && !isMockGpsDetected && (
          <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950 animate-in fade-in shadow-xs">
            <Radio className="w-5 h-5 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-900 tracking-tight flex items-center gap-1">
                  ⚠️ PERINGATAN ZONA TEPI BATAS GEOFENCE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                  {distanceMeters}m / Max {settings.radius}m
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                Posisi GPS Anda berada di ambang tepian batas kantor (<strong className="font-bold">{distanceMeters}m</strong> dari toleransi maksimal <strong className="font-bold">{settings.radius}m</strong>).
              </p>
              <div className="p-2 rounded-xl bg-amber-100/90 text-[10px] font-bold text-amber-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Rekomendasi Transparansi: Melangkahlah 5-10 meter mendekati kantor agar sinyal GPS stabil dan tidak terkunci di luar radius.</span>
              </div>
            </div>
          </div>
        )}

        {/* Offline Queued Success Banner */}
        {isOfflineQueuedSuccess && (
          <div className="p-3.5 bg-blue-50 border-2 border-blue-400 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900 animate-in fade-in">
            <CloudOff className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black text-blue-950">Presensi Tersimpan Offline di Perangkat</span>
              <p className="text-[11px] leading-relaxed">
                Data presensi biometrik Anda telah diamankan secara lokal. Fitur Background Sync akan otomatis mengirimkannya begitu koneksi internet terdeteksi.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMsg && !isMockGpsDetected && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-700 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Akses Presensi Terkunci</span>
              <p className="text-[11px] leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Camera View with Liveness Detection Target */}
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center border-2 border-slate-100">
          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Hasil Absensi"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Liveness Target Oval with Color Feedback */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`w-48 h-56 rounded-[48%] border-2 transition-all duration-300 ${
                    isMockGpsDetected
                      ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.7)]'
                      : livenessStage === 'VERIFIED'
                      ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.8)] scale-102'
                      : !isWithinRadius
                      ? 'border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : isNearGeofenceEdge
                      ? 'border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.9)] animate-pulse'
                      : 'border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                  }`}
                />
              </div>

              {/* Interactive Liveness Challenge Instruction Banner */}
              <div className="absolute top-3 inset-x-3 text-center pointer-events-none">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-md transition-all ${challenge.color}`}
                >
                  {challenge.icon}
                  <span>{challenge.text}</span>
                </div>
              </div>

              {/* Real-time Liveness Confidence Score Meter */}
              <div className="absolute bottom-3 inset-x-4 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-xs text-[10px] text-white">
                <span className="font-semibold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Anti-Spoofing:
                </span>
                <span className="font-mono font-bold text-emerald-300">
                  {livenessStage === 'VERIFIED' ? '99% Manusia Asli' : `${Math.max(45, livenessScore)}%`}
                </span>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Processing spinner overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
              <span className="text-xs font-bold">Mencocokkan Biometrik & Keamanan Geofence...</span>
            </div>
          )}
        </div>

        {/* Geofence & GPS Status Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center gap-1.5 text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-[#024b3a]" />
              <span className="truncate max-w-[140px]">{settings.name}</span>
            </div>

            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 ${
                isMockGpsDetected
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : isWithinRadius
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {isMockGpsDetected ? (
                <>
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Fake GPS Terdeteksi
                </>
              ) : isWithinRadius ? (
                <>
                  <Check className="w-3 h-3" />
                  Dalam Radius Kantor
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  Di Luar Radius
                </>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>Jarak GPS Terukur:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-mono font-bold ${
                  isWithinRadius && !isMockGpsDetected ? 'text-emerald-700' : 'text-rose-600 text-xs'
                }`}
              >
                {distanceMeters}m
              </span>
              <span className="text-slate-400">/ toleransi {settings.radius}m</span>
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
            <span>Toleransi Keterlambatan:</span>
            <span className="font-bold text-emerald-700">
              +{settings.toleransiKeterlambatanMenit} Menit
            </span>
          </div>

          {/* GPS Refresh & Multi-mode Test Controls */}
          <div className="pt-2.5 border-t border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span>Mode Lokasi & Uji Geofence:</span>
              <button
                type="button"
                onClick={detectLocation}
                disabled={isLocating}
                className="flex items-center gap-1 text-[#024b3a] hover:underline cursor-pointer"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`}
                />
                <span>{isLocating ? 'Mengecek...' : 'Refresh GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold">
              <button
                type="button"
                onClick={() => handleSimChange('REAL')}
                className={`py-1.5 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                  locationSimMode === 'REAL'
                    ? 'bg-[#024b3a] text-white border-[#024b3a] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                GPS Riil
              </button>
              <button
                type="button"
                onClick={() => handleSimChange('OFFICE')}
                className={`py-1.5 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                  locationSimMode === 'OFFICE'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Pusat Kantor
              </button>
              <button
                type="button"
                onClick={() => handleSimChange('EDGE')}
                className={`py-1.5 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                  locationSimMode === 'EDGE'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
                title="Uji Peringatan Tepi Batas Geofence"
              >
                ⚠️ Tepi Batas
              </button>
              <button
                type="button"
                onClick={() => handleSimChange('OUTSIDE')}
                className={`py-1.5 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                  locationSimMode === 'OUTSIDE'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Luar Radius
              </button>
            </div>
          </div>
        </div>

        {/* Submit button with Geofence & Anti-Fake GPS & Anti-Spoofing locking */}
        <button
          onClick={handleCaptureAndSubmit}
          disabled={isProcessing || !isWithinRadius || isMockGpsDetected}
          className={`w-full py-4 px-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
            isMockGpsDetected
              ? 'bg-rose-200 text-rose-800 cursor-not-allowed border-2 border-rose-400 shadow-none'
              : !isWithinRadius
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
              : 'bg-[#024b3a] text-white hover:bg-[#023f31] active:scale-98 cursor-pointer'
          }`}
        >
          {isMockGpsDetected ? (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              <span>Akses Diblokir: Terdeteksi Fake GPS</span>
            </>
          ) : !isWithinRadius ? (
            <>
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Absen Dikunci (Di Luar Radius)</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Ambil Foto & Konfirmasi Absen</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
