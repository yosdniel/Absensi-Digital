import React, { useState } from 'react';
import {
  Fingerprint,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { login, settings } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !pin.trim()) {
      setError('Harap masukkan ID Pengguna/Email dan PIN.');
      return;
    }

    const res = login(identifier, pin);
    if (!res.success) {
      setError(res.message || 'Login gagal.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-radial from-[#e8f3f0] via-[#f2f7fb] to-[#e4eef6] select-none">
      {/* Background glowing accents */}
      <div className="fixed top-10 left-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-[#024b3a] to-[#0a6c55] flex items-center justify-center mb-4 shadow-lg shadow-[#024b3a]/30 ring-8 ring-[#024b3a]/10">
            <Fingerprint className="w-11 h-11 text-white stroke-[1.8]" />
          </div>

          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            {settings.name}
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hadir<span className="text-[#024b3a]">.in</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Sistem Absensi Digital Biometrik & Manajemen SPPG
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-600 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* ID Pengguna / Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ID Pengguna atau Email
            </label>
            <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#024b3a]/30 focus-within:bg-white transition-all">
              <Mail className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Contoh: DEV-001, SPPG-001, atau email"
                className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* PIN Keamanan */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                PIN Keamanan
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                4-6 Digit Angka
              </span>
            </div>
            <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#024b3a]/30 focus-within:bg-white transition-all">
              <KeyRound className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN"
                className="w-full bg-transparent text-sm font-bold tracking-widest text-slate-800 placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal focus:outline-hidden"
                maxLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-slate-400 hover:text-slate-600 focus:outline-hidden p-1 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Masuk Sekarang Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-[#024b3a] text-white font-bold text-sm shadow-lg shadow-[#024b3a]/30 hover:bg-[#023f31] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>Masuk Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Notice for registration */}
        <div className="mt-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
          <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Pendaftaran akun baru dan pengaturan PIN hanya dapat dilakukan oleh <strong>Administrator (Developer / Kepala SPPG)</strong> melalui panel anggota.
          </span>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>&copy;2026 <strong className="font-bold text-slate-600">Mindspace Studio</strong></span>
          <span>Keamanan Terenkripsi PIN</span>
        </div>
      </div>
    </div>
  );
};
