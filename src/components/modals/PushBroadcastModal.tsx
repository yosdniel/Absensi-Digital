import React, { useState } from 'react';
import {
  Bell,
  X,
  Send,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Users,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PushPriority } from '../../types';

interface PushBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushBroadcastModal: React.FC<PushBroadcastModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, sendPushNotification } = useApp();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<PushPriority>('PENTING');
  const [targetDivision, setTargetDivision] = useState<string>('ALL');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const divisionOptions = [
    { value: 'ALL', label: '📢 Seluruh Divisi (Broadcast Seluruh HP Anggota SPPG)' },
    { value: 'Divisi Persiapan', label: '🥗 Divisi Persiapan Bahan Baku' },
    { value: 'Divisi Pengolahan', label: '🍳 Divisi Pengolahan & Juru Masak' },
    { value: 'Divisi Pemorsian', label: '🍱 Divisi Pemorsian & Gramasi' },
    { value: 'Divisi Distribusi', label: '🚚 Divisi Distribusi & Kurir' },
    { value: 'Divisi Cuci Ompreng', label: '🧼 Divisi Cuci Ompreng & Sanitasi' },
    { value: 'Keamanan', label: '🛡️ Keamanan & Security' },
    { value: 'Kebersihan', label: '🧹 Kebersihan Lingkungan' },
    { value: 'Staff Manajemen Operasional', label: '💼 Staff Manajemen & Administrasi' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Judul notifikasi tidak boleh kosong.');
      return;
    }

    if (!message.trim()) {
      setErrorMsg('Isi pesan notifikasi tidak boleh kosong.');
      return;
    }

    const res = sendPushNotification({
      title: title.trim(),
      message: message.trim(),
      priority,
      targetDivision,
    });

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setTitle('');
        setMessage('');
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Gagal mengirim notifikasi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Kirim Push Notifikasi
              </h3>
              <p className="text-[11px] text-slate-400">
                Broadcast langsung ke layar & notifikasi HP anggota
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Push notifikasi berhasil disiarkan ke handphone anggota!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Target Division */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#024b3a]" />
              <span>Target Penerima Divisi *</span>
            </label>
            <select
              value={targetDivision}
              onChange={(e) => setTargetDivision(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#024b3a]/20"
            >
              {divisionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tingkat Prioritas Notifikasi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['INFO', 'PENTING', 'URGENT'] as PushPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-xl font-extrabold text-[11px] border transition-all cursor-pointer ${
                    priority === p
                      ? p === 'URGENT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : p === 'PENTING'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p === 'URGENT' ? '🚨 Mendesak' : p === 'PENTING' ? '⚠️ Penting' : 'ℹ️ Info Umum'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Judul Notifikasi *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: 🔔 Instruksi Persiapan Dapur Subuh"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#024b3a]/20"
              required
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Isi Pesan Notifikasi Handphone *
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan instruksi atau pengumuman yang akan langsung muncul di bar notifikasi HP..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#024b3a]/20 resize-none leading-relaxed"
              required
            />
          </div>

          {/* Real-time Phone Notification Mockup Preview */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold">
                <Smartphone className="w-3 h-3 text-slate-300" />
                Preview Notifikasi di HP User
              </span>
              <span>Baru Saja</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between font-bold text-[11px] text-white">
                <span className="truncate pr-2">{title || 'Judul Notifikasi SPPG'}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold uppercase shrink-0">
                  {targetDivision === 'ALL' ? 'Semua Divisi' : targetDivision}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                {message || 'Isi pesan akan tampil di lockscreen dan banner HP anggota...'}
              </p>
              <div className="text-[9px] text-slate-400 pt-0.5">
                Pengirim: {currentUser?.name} ({currentUser?.role})
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#024b3a] hover:bg-[#023f31] text-white font-bold shadow-md shadow-[#024b3a]/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Siarkan ke HP Anggota</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
