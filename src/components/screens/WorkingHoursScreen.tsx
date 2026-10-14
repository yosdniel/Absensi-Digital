import React, { useState } from 'react';
import {
  LogIn,
  Timer,
  LogOut,
  Check,
  Clock,
  Edit3,
  Users,
  ShieldCheck,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import { DivisionSchedule, canManageWorkingHours } from '../../types';

interface WorkingHoursScreenProps {
  onBack: () => void;
}

export const WorkingHoursScreen: React.FC<WorkingHoursScreenProps> = ({ onBack }) => {
  const {
    currentUser,
    settings,
    updateSettings,
    divisionSchedules,
    updateDivisionSchedule,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'division' | 'global'>('division');

  // Edit division modal
  const [editingSchedule, setEditingSchedule] = useState<DivisionSchedule | null>(null);
  const [editForm, setEditForm] = useState({
    jamMasuk: '06:00',
    batasJamMasuk: '07:00',
    toleransiMenit: 15,
    jamPulang: '15:00',
  });

  // Global settings state
  const [jamMasukMulai, setJamMasukMulai] = useState(settings.jamMasukMulai);
  const [batasJamMasuk, setBatasJamMasuk] = useState(settings.batasJamMasuk);
  const [jamPulangMulai, setJamPulangMulai] = useState(settings.jamPulangMulai);
  const [toleransiKeterlambatanMenit, setToleransiKeterlambatanMenit] = useState(
    settings.toleransiKeterlambatanMenit ?? 15
  );
  const [intervalTerlambat, setIntervalTerlambat] = useState(settings.intervalTerlambat || 30);
  const [requireFaceLiveness, setRequireFaceLiveness] = useState(settings.requireFaceLiveness ?? true);
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const [tempInterval, setTempInterval] = useState(settings.intervalTerlambat || 30);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canEdit = canManageWorkingHours(currentUser?.role);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenEdit = (schedule: DivisionSchedule) => {
    if (!canEdit) {
      alert('Hanya Developer, Kepala SPPG, dan Staff yang dapat mengubah jadwal kerja.');
      return;
    }
    setEditingSchedule(schedule);
    setEditForm({
      jamMasuk: schedule.jamMasuk,
      batasJamMasuk: schedule.batasJamMasuk,
      toleransiMenit: schedule.toleransiMenit,
      jamPulang: schedule.jamPulang,
    });
  };

  const handleSaveDivisionSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    updateDivisionSchedule({
      ...editingSchedule,
      jamMasuk: editForm.jamMasuk,
      batasJamMasuk: editForm.batasJamMasuk,
      toleransiMenit: Number(editForm.toleransiMenit),
      jamPulang: editForm.jamPulang,
    });

    setEditingSchedule(null);
    showToast(`Jadwal ${editingSchedule.divisionName} berhasil diperbarui!`);
  };

  const handleSaveGlobal = () => {
    updateSettings({
      jamMasukMulai,
      batasJamMasuk,
      jamPulangMulai,
      toleransiKeterlambatanMenit: Number(toleransiKeterlambatanMenit),
      intervalTerlambat,
      requireFaceLiveness,
    });
    showToast('Pengaturan standar instansi berhasil disimpan!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 select-none">
      <Header title="Pengaturan Jam Kerja" onBack={onBack} />

      {/* Tab Switcher */}
      <div className="flex bg-[#034d3d]/15 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('division')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'division'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Jam Kerja per Divisi ({divisionSchedules.length})
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'global'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Standar Global & Toleransi
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#024b3a] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TAB 1: DIVISION SCHEDULES */}
      {activeTab === 'division' && (
        <div className="space-y-4">
          {/* Informational Guidance Banner */}
          <div className="bg-emerald-50/90 border border-emerald-100 rounded-3xl p-4.5 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#024b3a] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-900">
                Aturan Jam Kerja Terintegrasi Divisi SPPG
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Jam kerja setiap divisi berbeda dan diatur oleh <strong>Developer</strong>,{' '}
                <strong>Kepala SPPG</strong>, atau <strong>Staff</strong>. Koordinator divisi beserta anggotanya memiliki jam kerja yang sama persis (contoh: Koordinator Pemorsian & Divisi Pemorsian).
              </p>
            </div>
          </div>

          {/* Division Schedule Cards Grid */}
          <div className="space-y-3">
            {divisionSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#024b3a] font-black flex items-center justify-center text-sm shadow-2xs">
                      <Clock className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {schedule.divisionName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {schedule.description}
                      </p>
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(schedule)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#024b3a] hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Ubah Jam</span>
                    </button>
                  )}
                </div>

                {/* Scope: Coordinator & Members covered */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-[#024b3a] shrink-0" />
                  <span>
                    Berlaku sama untuk: <strong className="text-slate-900">{schedule.coordinatorRole}</strong> &{' '}
                    <strong className="text-slate-900">{schedule.memberRole}</strong>
                  </span>
                </div>

                {/* Time badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-2xl text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                      Jam Masuk
                    </span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {schedule.jamMasuk} WIB
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/50 border border-amber-100/60 rounded-2xl text-center">
                    <span className="block text-[10px] font-bold text-amber-700 uppercase mb-0.5">
                      Batas Masuk
                    </span>
                    <span className="text-sm font-black text-amber-800 font-mono">
                      {schedule.batasJamMasuk} WIB
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                      Toleransi
                    </span>
                    <span className="text-sm font-black text-slate-800 font-mono">
                      +{schedule.toleransiMenit} mnt
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/50 border border-blue-100/60 rounded-2xl text-center">
                    <span className="block text-[10px] font-bold text-blue-700 uppercase mb-0.5">
                      Jam Pulang
                    </span>
                    <span className="text-sm font-black text-blue-900 font-mono">
                      {schedule.jamPulang} WIB
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL SETTINGS & FALLBACK */}
      {activeTab === 'global' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              Standar Acuan & Aturan Keterlambatan
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Digunakan sebagai standar fallback untuk unit kerja di luar divisi terdaftar serta parameter toleransi biometrik.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Jam Masuk Pokok */}
            <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3.5 flex-1 pr-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#024b3a] flex items-center justify-center shrink-0">
                  <LogIn className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Jam Masuk Acuan</h4>
                  <p className="text-[11px] text-slate-400">Jam mulai absensi masuk standar</p>
                </div>
              </div>

              <div className="bg-slate-100 rounded-2xl px-3.5 py-2 shrink-0">
                <input
                  type="time"
                  value={jamMasukMulai}
                  onChange={(e) => setJamMasukMulai(e.target.value)}
                  disabled={!canEdit}
                  className="bg-transparent font-extrabold text-sm text-slate-900 text-center focus:outline-hidden disabled:opacity-70"
                />
              </div>
            </div>

            {/* Batas Jam Masuk Pokok */}
            <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3.5 flex-1 pr-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Timer className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Batas Jam Masuk Acuan</h4>
                  <p className="text-[11px] text-slate-400">Batas akhir sebelum dinyatakan terlambat</p>
                </div>
              </div>

              <div className="bg-slate-100 rounded-2xl px-3.5 py-2 shrink-0">
                <input
                  type="time"
                  value={batasJamMasuk}
                  onChange={(e) => setBatasJamMasuk(e.target.value)}
                  disabled={!canEdit}
                  className="bg-transparent font-extrabold text-sm text-slate-900 text-center focus:outline-hidden disabled:opacity-70"
                />
              </div>
            </div>

            {/* Toleransi Keterlambatan Global */}
            <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3.5 flex-1 pr-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Sliders className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Toleransi Keterlambatan Standar</h4>
                  <p className="text-[11px] text-slate-400">Masa kompensasi kehadiran setelah batas masuk</p>
                </div>
              </div>

              <select
                value={toleransiKeterlambatanMenit}
                onChange={(e) => setToleransiKeterlambatanMenit(Number(e.target.value))}
                disabled={!canEdit}
                className="bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-black text-slate-900 focus:outline-hidden disabled:opacity-70 cursor-pointer"
              >
                <option value={0}>0 Menit (Tanpa Toleransi)</option>
                <option value={5}>+5 Menit</option>
                <option value={10}>+10 Menit</option>
                <option value={15}>+15 Menit</option>
                <option value={20}>+20 Menit</option>
                <option value={30}>+30 Menit</option>
              </select>
            </div>

            {/* Jam Pulang Acuan */}
            <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3.5 flex-1 pr-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <LogOut className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Jam Pulang Acuan</h4>
                  <p className="text-[11px] text-slate-400">Karyawan dapat mulai absen pulang</p>
                </div>
              </div>

              <div className="bg-slate-100 rounded-2xl px-3.5 py-2 shrink-0">
                <input
                  type="time"
                  value={jamPulangMulai}
                  onChange={(e) => setJamPulangMulai(e.target.value)}
                  disabled={!canEdit}
                  className="bg-transparent font-extrabold text-sm text-slate-900 text-center focus:outline-hidden disabled:opacity-70"
                />
              </div>
            </div>

            {/* Save Global Button */}
            {canEdit && (
              <button
                onClick={handleSaveGlobal}
                className="w-full py-4 px-6 rounded-2xl bg-[#024b3a] text-white font-bold text-sm shadow-md shadow-[#024b3a]/25 hover:bg-[#023f31] active:scale-95 transition-all cursor-pointer"
              >
                Simpan Standar Global
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDIT DIVISION WORKING HOURS */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Atur Jam {editingSchedule.divisionName}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Berlaku untuk {editingSchedule.coordinatorRole} & {editingSchedule.memberRole}
                </p>
              </div>
              <button
                onClick={() => setEditingSchedule(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDivisionSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Jam Masuk Mulai *
                  </label>
                  <input
                    type="time"
                    value={editForm.jamMasuk}
                    onChange={(e) => setEditForm({ ...editForm, jamMasuk: e.target.value })}
                    className="w-full bg-transparent font-extrabold text-base text-slate-900 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Batas Jam Masuk *
                  </label>
                  <input
                    type="time"
                    value={editForm.batasJamMasuk}
                    onChange={(e) => setEditForm({ ...editForm, batasJamMasuk: e.target.value })}
                    className="w-full bg-transparent font-extrabold text-base text-amber-700 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Toleransi Keterlambatan
                  </label>
                  <select
                    value={editForm.toleransiMenit}
                    onChange={(e) => setEditForm({ ...editForm, toleransiMenit: Number(e.target.value) })}
                    className="w-full bg-transparent font-bold text-xs text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value={0}>0 Menit</option>
                    <option value={5}>+5 Menit</option>
                    <option value={10}>+10 Menit</option>
                    <option value={15}>+15 Menit</option>
                    <option value={20}>+20 Menit</option>
                    <option value={30}>+30 Menit</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Jam Pulang Mulai *
                  </label>
                  <input
                    type="time"
                    value={editForm.jamPulang}
                    onChange={(e) => setEditForm({ ...editForm, jamPulang: e.target.value })}
                    className="w-full bg-transparent font-extrabold text-base text-blue-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[11px] text-amber-900 leading-relaxed font-medium">
                Setiap anggota di <strong>{editingSchedule.divisionName}</strong> dan koordinatornya (<strong>{editingSchedule.coordinatorRole}</strong>) akan otomatis mengikuti jam kerja ini saat melakukan presensi biometrik dan menerima peringatan jadwal.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSchedule(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#024b3a] text-white text-xs font-bold shadow-md hover:bg-[#023f31] active:scale-95 transition-all cursor-pointer"
                >
                  Simpan Jadwal Divisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
