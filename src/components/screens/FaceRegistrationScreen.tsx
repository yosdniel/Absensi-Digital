import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, RefreshCw, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

interface FaceRegistrationScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const FaceRegistrationScreen: React.FC<FaceRegistrationScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const { currentUser, registerFace } = useApp();

  const [streamActive, setStreamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch {
        setCameraError('Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan mode simulasi wajah.');
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    setIsScanning(true);

    setTimeout(() => {
      if (videoRef.current && canvasRef.current && streamActive) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 400;
        canvas.height = video.videoHeight || 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setCapturedPhoto(dataUrl);
        }
      } else {
        // Fallback sample face capture
        setCapturedPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80');
      }
      setIsScanning(false);
    }, 1000);
  };

  const handleConfirm = () => {
    if (!currentUser || !capturedPhoto) return;

    registerFace(currentUser.id, capturedPhoto);
    setSuccess(true);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignored
    }

    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const handlePresetSelect = (url: string) => {
    setCapturedPhoto(url);
  };

  return (
    <div className="relative min-h-full flex flex-col justify-between bg-[#f4f7fb] pb-10 select-none">
      <div>
        <Header title="Daftar Wajah" onBack={onBack} />

        <div className="px-5 space-y-5">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              Pendaftaran Biometrik Wajah
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Posisikan wajah Anda tepat di dalam bingkai oval di bawah ini.
            </p>
          </div>

          {/* Camera / Preview Viewport */}
          <div className="relative w-full aspect-square max-w-xs mx-auto rounded-3xl overflow-hidden bg-slate-950 shadow-xl border-4 border-white">
            {capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Captured Face"
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

                {/* Oval Guide Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`w-52 h-64 rounded-[50%] border-3 transition-colors ${
                      isScanning
                        ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]'
                        : 'border-white/80'
                    }`}
                  />
                </div>

                {/* Scanning laser animation */}
                {isScanning && (
                  <div className="absolute inset-x-8 top-12 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
                )}
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* Success badge overlay */}
            {success && (
              <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-2xs flex flex-col items-center justify-center text-white animate-in zoom-in-95">
                <ShieldCheck className="w-16 h-16 text-emerald-400 mb-2" />
                <span className="text-base font-extrabold">Wajah Terdaftar!</span>
                <span className="text-xs text-emerald-200">Data biometrik tersimpan aman</span>
              </div>
            )}
          </div>

          {cameraError && !capturedPhoto && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Sample Preset faces for easy demo */}
          {!capturedPhoto && (
            <div className="space-y-2 pt-1">
              <span className="block text-[11px] font-bold text-slate-400 text-center">
                Atau pilih contoh foto wajah instan:
              </span>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handlePresetSelect('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80')
                  }
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md active:scale-95"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Preset 1"
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePresetSelect('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80')
                  }
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md active:scale-95"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Preset 2"
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handlePresetSelect('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80')
                  }
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md active:scale-95"
                >
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    alt="Preset 3"
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 pt-4">
        {capturedPhoto ? (
          <div className="flex gap-3">
            <button
              onClick={() => setCapturedPhoto(null)}
              className="flex-1 py-4 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-xs flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Foto Ulang</span>
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-4 px-4 rounded-2xl bg-[#024b3a] text-white font-bold text-sm shadow-md hover:bg-[#023f31] flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Wajah</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleCapture}
            disabled={isScanning}
            className="w-full py-4 px-6 rounded-2xl bg-[#024b3a] text-white font-bold text-base shadow-md shadow-[#024b3a]/25 hover:bg-[#023f31] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            <span>{isScanning ? 'Memindai Wajah...' : 'Ambil Foto Wajah'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
