import React, { useState } from 'react';
import { Calendar, Check, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';

interface WorkingDaysScreenProps {
  onBack: () => void;
}

export const WorkingDaysScreen: React.FC<WorkingDaysScreenProps> = ({ onBack }) => {
  const { settings, setWorkingDays } = useApp();

  const allDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const [selectedDays, setSelectedDays] = useState<string[]>(
    settings.workingDays || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const setPreset = (presetDays: string[]) => {
    setSelectedDays(presetDays);
  };

  const handleSave = () => {
    setWorkingDays(selectedDays);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onBack();
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none">
      <Header title="Pengaturan Hari Kerja Instansi" onBack={onBack} />

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] uppercase">
              Khusus Developer
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Atur Hari Kerja Operasional SPPG
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Tentukan hari apa saja karyawan diwajibkan melakukan presensi kehadiran. Hari yang tidak dipilih akan otomatis dicatat sebagai hari libur kerja.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Pengaturan hari kerja berhasil disimpan!</span>
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Pilih Template Hari Kerja:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreset(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="font-bold text-[#024b3a]">5 Hari Kerja</div>
              <div className="text-[11px] text-slate-400">Senin – Jumat</div>
            </button>

            <button
              type="button"
              onClick={() => setPreset(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="font-bold text-[#024b3a]">6 Hari Kerja (SPPG)</div>
              <div className="text-[11px] text-slate-400">Senin – Sabtu</div>
            </button>

            <button
              type="button"
              onClick={() => setPreset(allDays)}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-semibold text-slate-800 transition-colors"
            >
              <div className="font-bold text-[#024b3a]">7 Hari Penuh</div>
              <div className="text-[11px] text-slate-400">Senin – Minggu</div>
            </button>
          </div>
        </div>

        {/* Interactive Days Checklist */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-700">
            Daftar Hari Operasional:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allDays.map((day) => {
              const isActive = selectedDays.includes(day);

              return (
                <div
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? 'bg-emerald-50/80 border-[#024b3a] text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-4 h-4 ${isActive ? 'text-[#024b3a]' : 'text-slate-300'}`} />
                    <span className="text-sm font-bold">{day}</span>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-[#024b3a] text-white' : 'bg-slate-100 text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Info */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Total Hari Kerja Aktif:</span>
          <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-mono">
            {selectedDays.length} Hari / Minggu
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full py-4 px-6 rounded-2xl bg-[#024b3a] text-white font-bold text-sm shadow-lg shadow-[#024b3a]/25 hover:bg-[#023f31] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Pengaturan Hari Kerja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
