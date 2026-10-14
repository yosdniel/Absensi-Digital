import React, { useState, useRef } from 'react';
import { Calendar, Camera, Upload, Check, ChevronDown, AlertCircle, Clock, Info } from 'lucide-react';
import { Header } from '../common/Header';
import { useApp, formatIndonesianDate } from '../../context/AppContext';

interface LeaveFormScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const LeaveFormScreen: React.FC<LeaveFormScreenProps> = ({ onBack, onSuccess }) => {
  const { submitLeaveRequest, currentUser } = useApp();

  const [type, setType] = useState<'Sakit' | 'Izin' | 'Cuti'>('Sakit');
  const [reason, setReason] = useState('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayFormatted = formatIndonesianDate(new Date());

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsePresetPhoto = () => {
    setProofUrl('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Keterangan WAJIB!
    if (!reason.trim()) {
      setError('Keterangan / alasan lengkap wajib diisi.');
      return;
    }

    // Lampiran TIDAK wajib!
    const res = submitLeaveRequest({
      type,
      reason: reason.trim(),
      proofUrl: proofUrl || undefined,
    });

    if (!res.success) {
      setError(res.message || 'Gagal mengajukan izin.');
      return;
    }

    onSuccess();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none">
      <Header title="Pengajuan Izin" onBack={onBack} />

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-5">
        {/* Header Description */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
            Formulir Pengajuan Ketidakhadiran
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Lengkapi alasan ketidakhadiran Anda untuk hari ini.
          </p>
        </div>

        {/* 1-Day Rule Notice Banner as per user instruction */}
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block mb-0.5">Ketentuan Pengajuan 1 Hari Kerja:</strong>
            Sesuai kebijakan SPPG, pengajuan izin berlaku untuk <strong>1 hari kerja</strong> (hari ini). Jika Anda berhalangan hadir besok, pengajuan dilakukan kembali pada hari besok.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Jenis Pengajuan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Jenis Pengajuan
            </label>
            <div className="relative bg-slate-50 rounded-2xl border border-slate-200">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'Sakit' | 'Izin' | 'Cuti')}
                className="w-full bg-transparent px-4 py-3.5 text-sm font-bold text-slate-800 appearance-none focus:outline-hidden"
              >
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin Keperluan Mendesak</option>
                <option value="Cuti">Cuti Tahunan</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                <ChevronDown className="w-4 h-4 text-[#024b3a]" />
              </div>
            </div>
          </div>

          {/* Tanggal Izin: FIXED 1 HARI (No multi-day range) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Tanggal Izin (1 Hari)
            </label>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-[#024b3a]" />
                <span>{todayFormatted}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                1 Hari Kerja
              </span>
            </div>
          </div>

          {/* Keterangan / Alasan Lengkap (WAJIB) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Keterangan / Alasan Lengkap <span className="text-red-600">* (Wajib)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Harap tuliskan detail</span>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#024b3a]/25 transition-all">
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tuliskan alasan ketidakhadiran Anda secara jelas dan lengkap di sini..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-none font-medium leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Lampiran Bukti / Surat Dokter (TIDAK WAJIB / OPSIONAL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Lampiran Bukti / Surat Keterangan <span className="text-slate-400 font-normal">(Opsional / Tidak Wajib)</span>
              </label>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {proofUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xs bg-slate-900 group">
                <img
                  src={proofUrl}
                  alt="Lampiran"
                  className="w-full h-40 object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1.5 px-3 rounded-xl bg-white/90 text-slate-900 text-xs font-bold shadow-md hover:bg-white"
                  >
                    Ganti Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setProofUrl('')}
                    className="py-1.5 px-3 rounded-xl bg-red-600/90 text-white text-xs font-bold shadow-md hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-200/60 text-slate-600 flex items-center justify-center mb-2">
                    <Camera className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    Unggah Bukti / Surat (Jika Ada)
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Tidak wajib dilampirkan
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-[#024b3a] text-white font-bold text-sm shadow-lg shadow-[#024b3a]/25 hover:bg-[#023f31] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Kirim Pengajuan Izin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
