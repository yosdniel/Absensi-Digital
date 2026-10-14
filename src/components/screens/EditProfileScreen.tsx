import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Camera,
  Mail,
  Phone,
  KeyRound,
  Shield,
  Building,
  Check,
  AlertCircle,
  Upload,
  Lock,
  RefreshCw,
  Wifi,
  WifiOff,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import { isDeveloperRole } from '../../types';

interface EditProfileScreenProps {
  onBack: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const {
    currentUser,
    updateUserProfile,
    settings,
    backgroundSyncEnabled,
    setBackgroundSyncEnabled,
    pendingOfflineAttendance,
    syncOfflineAttendance,
  } = useApp();

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await syncOfflineAttendance();
      setSyncStatusMsg(res.message);
    } catch {
      setSyncStatusMsg('Gagal menyinkronkan data offline.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }
  };

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [photoUrl, setPhotoUrl] = useState(currentUser?.facePhotoUrl || '');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const isDev = isDeveloperRole(currentUser.role);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama lengkap tidak boleh kosong.');
      return;
    }

    if (newPin) {
      if (newPin.length < 4) {
        setError('PIN keamanan minimal 4 digit angka.');
        return;
      }
      if (newPin !== confirmPin) {
        setError('Konfirmasi PIN tidak cocok dengan PIN baru.');
        return;
      }
    }

    const updates: any = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      phoneRegistered: Boolean(phone.trim()),
      facePhotoUrl: photoUrl,
    };

    // Only developer can edit department
    if (isDev) {
      updates.department = department.trim();
    }

    if (newPin) {
      updates.pin = newPin.trim();
    }

    updateUserProfile(currentUser.id, updates);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onBack();
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Header title="Pengaturan & Edit Profil" onBack={onBack} />

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-600 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Profil berhasil diperbarui!</span>
          </div>
        )}

        {/* Profile Picture Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#024b3a] text-white flex items-center justify-center shadow-md hover:bg-[#023f31] transition-transform active:scale-90"
              title="Ganti Foto Profil"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left flex-1 space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Foto Profil & Biometrik
            </h3>
            <p className="text-xs text-slate-400">
              Format JPG, PNG atau foto kamera selfie.
            </p>
            <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Foto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Read-only System Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">ID Pengguna</span>
            <span className="text-xs font-extrabold text-slate-800 font-mono">{currentUser.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Jabatan / Role</span>
            <span className="text-xs font-extrabold text-[#024b3a]">{currentUser.role}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Instansi</span>
            <span className="text-xs font-bold text-slate-800 truncate block">{settings.name}</span>
          </div>
        </div>

        {/* Personal Details Fields */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Informasi Pribadi
          </h4>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
              <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Department / Divisi - DISABLED / READONLY for regular user as requested! */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Department / Divisi
              </label>
              {!isDev && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Terkunci (Hanya Developer yang dapat mengubah)</span>
                </span>
              )}
            </div>
            <div className={`relative flex items-center rounded-2xl border px-4 py-3 ${
              isDev ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/80 border-slate-200/60 cursor-not-allowed'
            }`}>
              <Building className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={!isDev}
                className="w-full bg-transparent text-sm font-bold text-slate-700 focus:outline-hidden disabled:opacity-80"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@sppg.id"
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                <Phone className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Change PIN Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ubah PIN Keamanan (Opsional)
            </h4>
            <span className="text-[11px] text-slate-400">Kosongkan jika tidak ingin mengubah</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                PIN Baru (4-6 Digit)
              </label>
              <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                <KeyRound className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="password"
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="PIN Baru"
                  maxLength={6}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Konfirmasi PIN Baru
              </label>
              <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
                <KeyRound className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Ulangi PIN Baru"
                  maxLength={6}
                  className="w-full bg-transparent text-sm font-mono font-bold text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Background Sync & Offline Attendance Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-[#024b3a]" />
              <span>Sinkronisasi Latar Belakang (Background Sync)</span>
            </h4>
            <span className="flex items-center gap-1 text-[11px] font-bold">
              {isOnline ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Online
                </span>
              ) : (
                <span className="text-rose-500 flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Offline
                </span>
              )}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800">
                  Otomatis Push Presensi Offline (Background Sync)
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Secara otomatis mengunggah data presensi yang tersimpan di perangkat begitu koneksi internet terdeteksi stabil tanpa perlu input manual.
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setBackgroundSyncEnabled(!backgroundSyncEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  backgroundSyncEnabled ? 'bg-[#024b3a]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    backgroundSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Offline queue indicator */}
            <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Antrean Perangkat:</span>{' '}
                <span className="font-mono font-bold text-[#024b3a]">
                  {pendingOfflineAttendance.length}
                </span>{' '}
                data presensi tertunda
              </div>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing || pendingOfflineAttendance.length === 0}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  pendingOfflineAttendance.length > 0
                    ? 'bg-[#024b3a] text-white hover:bg-[#023f31] cursor-pointer shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>

            {syncStatusMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{syncStatusMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#024b3a] hover:bg-[#023f31] text-white text-xs font-bold shadow-md shadow-[#024b3a]/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
