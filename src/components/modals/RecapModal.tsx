import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  X,
  Check,
  Calendar,
  Info,
  Clock,
  Sliders,
  Settings,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  isDeveloperRole,
  isKepalaSPPGRole,
  isStaffRole,
} from '../../types';

interface RecapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecapModal: React.FC<RecapModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, users, attendance, settings, updateWorkPeriodConfig } = useApp();

  const isDev = isDeveloperRole(currentUser?.role);
  const isKepala = isKepalaSPPGRole(currentUser?.role);
  const isStaff = isStaffRole(currentUser?.role);
  const canManagePeriod = isDev || isKepala || isStaff;

  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedPeriod, setSelectedPeriod] = useState<'P1' | 'P2' | 'MANUAL' | 'ALL'>('P1');
  const [selectedUser, setSelectedUser] = useState<string>('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Manual Period Editor State
  const [isEditingManualPeriod, setIsEditingManualPeriod] = useState(false);
  const [manualPeriodName, setManualPeriodName] = useState(
    settings.workPeriodConfig?.periodName || 'Periode Kerja Operasional SPPG'
  );
  const [manualStartDate, setManualStartDate] = useState(
    settings.workPeriodConfig?.startDate || '2026-04-01'
  );
  const [manualEndDate, setManualEndDate] = useState(
    settings.workPeriodConfig?.endDate || '2026-04-14'
  );
  const [manualSavedMsg, setManualSavedMsg] = useState(false);

  if (!isOpen) return null;

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const years = ['2025', '2026', '2027'];

  const indonesianMonthsMap: Record<string, number> = {
    Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
    Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11,
  };

  const handleSaveManualPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkPeriodConfig({
      mode: 'MANUAL',
      periodName: manualPeriodName.trim(),
      startDate: manualStartDate,
      endDate: manualEndDate,
      notes: 'Ditentukan secara manual oleh Developer, Kepala SPPG, dan Staff.',
    });
    setManualSavedMsg(true);
    setTimeout(() => {
      setManualSavedMsg(false);
      setIsEditingManualPeriod(false);
    }, 1200);
  };

  const handleDownload = () => {
    // Filter attendance records by 2-week period or manual period
    const filteredAttendance = attendance.filter((a) => {
      if (selectedUser !== 'ALL' && a.userId !== selectedUser) return false;

      let recordDate = new Date(a.timestamp);
      if (isNaN(recordDate.getTime())) {
        recordDate = new Date();
      }

      if (selectedPeriod === 'MANUAL' && settings.workPeriodConfig) {
        const start = new Date(settings.workPeriodConfig.startDate + 'T00:00:00');
        const end = new Date(settings.workPeriodConfig.endDate + 'T23:59:59');
        return recordDate >= start && recordDate <= end;
      }

      const dayNum = recordDate.getDate();

      if (selectedPeriod === 'P1') {
        // 1 - 14 (Periode 1 / 2 Minggu Pertama)
        return dayNum >= 1 && dayNum <= 14;
      } else if (selectedPeriod === 'P2') {
        // 15 - 31 (Periode 2 / 2 Minggu Kedua)
        return dayNum >= 15;
      }
      return true;
    });

    const periodLabel =
      selectedPeriod === 'P1'
        ? 'Periode 1 (Tgl 01 - 14 / 2 Minggu Pertama)'
        : selectedPeriod === 'P2'
        ? 'Periode 2 (Tgl 15 - Akhir Bulan / 2 Minggu Kedua)'
        : selectedPeriod === 'MANUAL'
        ? `Periode Manual Manajemen: ${settings.workPeriodConfig?.periodName || 'Kustom'} (${settings.workPeriodConfig?.startDate} s/d ${settings.workPeriodConfig?.endDate})`
        : 'Satu Bulan Penuh (Periode 1 & 2)';

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Laporan Rekapitulasi Absensi SPPG - ${settings.name}\n`;
    csvContent += `Periode Rekap: ${periodLabel}\n`;
    csvContent += `Penetapan Periode: ${
      selectedPeriod === 'MANUAL'
        ? `Manual oleh ${settings.workPeriodConfig?.lastUpdatedBy || 'Manajemen'} (${settings.workPeriodConfig?.lastUpdatedRole || 'Staff'})`
        : 'Siklus Otomatis 2 Mingguan SPPG'
    }\n`;
    csvContent += `Bulan & Tahun: ${selectedMonth} ${selectedYear}\n`;
    csvContent += `Anggota: ${
      selectedUser === 'ALL'
        ? 'Semua Anggota'
        : users.find((u) => u.id === selectedUser)?.name
    }\n`;
    csvContent += `Ketentuan Jadwal: Persiapan & Pengolahan (Masuk Minggu), Security (Senin-Sabtu, Minggu Libur), Divisi Lain (Senin-Jumat)\n\n`;
    csvContent +=
      'ID Karyawan,Nama,Divisi,Tipe,Waktu,Tanggal,Status,Jarak GPS (m),Radius Kantor\n';

    filteredAttendance.forEach((rec) => {
      const u = users.find((user) => user.id === rec.userId);
      const division = u?.department || rec.department || 'Operasional SPPG';
      csvContent += `"${rec.userId}","${rec.userName}","${division}","${rec.type}","${rec.timeStr}","${rec.dateStr}","${rec.status}","${rec.distanceMeters}","${
        rec.withinRadius ? 'DALAM RADIUS' : 'LUAR RADIUS'
      }"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileNamePeriod =
      selectedPeriod === 'P1'
        ? 'Periode_1_Tgl01-14'
        : selectedPeriod === 'P2'
        ? 'Periode_2_Tgl15-31'
        : selectedPeriod === 'MANUAL'
        ? `Periode_Manual_${settings.workPeriodConfig?.startDate || 'Custom'}`
        : 'Sebulan_Penuh';
    link.setAttribute(
      'download',
      `Rekap_Absensi_SPPG_${fileNamePeriod}_${selectedMonth}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-[#024b3a]" />
              <span>Rekap Absensi Kerja SPPG</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Siklus 2 Mingguan / Periode Manual Manajemen
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Period Selector Tabs */}
        <div className="mb-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Pilih Periode Kerja:
            </label>
            {canManagePeriod && (
              <button
                type="button"
                onClick={() => setIsEditingManualPeriod(!isEditingManualPeriod)}
                className="text-[10px] font-bold text-[#024b3a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                <span>{isEditingManualPeriod ? 'Tutup Atur Periode' : 'Atur Periode Manual'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedPeriod('P1')}
              className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                selectedPeriod === 'P1'
                  ? 'bg-[#024b3a] text-white border-[#024b3a] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px] font-extrabold">Periode 1</div>
              <div
                className={`text-[10px] ${
                  selectedPeriod === 'P1' ? 'text-emerald-100' : 'text-slate-500'
                }`}
              >
                Tgl 01 - 14 (14 Hari)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPeriod('P2')}
              className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                selectedPeriod === 'P2'
                  ? 'bg-[#024b3a] text-white border-[#024b3a] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-[11px] font-extrabold">Periode 2</div>
              <div
                className={`text-[10px] ${
                  selectedPeriod === 'P2' ? 'text-emerald-100' : 'text-slate-500'
                }`}
              >
                Tgl 15 - Akhir Bulan
              </div>
            </button>
          </div>

          {/* Manual Period Selected Button */}
          <button
            type="button"
            onClick={() => setSelectedPeriod('MANUAL')}
            className={`w-full p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
              selectedPeriod === 'MANUAL'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <div>
              <div className="text-[11px] font-extrabold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Periode Manual (Ditentukan Developer, Kepala SPPG & Staff)</span>
              </div>
              <div
                className={`text-[10px] ${
                  selectedPeriod === 'MANUAL' ? 'text-amber-100' : 'text-amber-700'
                }`}
              >
                {settings.workPeriodConfig?.periodName || 'Kustom'}:{' '}
                {settings.workPeriodConfig?.startDate} s/d {settings.workPeriodConfig?.endDate}
              </div>
            </div>
            {selectedPeriod === 'MANUAL' && <Check className="w-4 h-4 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => setSelectedPeriod('ALL')}
            className={`w-full py-1.5 px-3 rounded-xl text-center text-[10px] font-bold border transition-all cursor-pointer ${
              selectedPeriod === 'ALL'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold'
                : 'bg-slate-100/60 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Atau Unduh 1 Bulan Penuh (Periode 1 & 2 Sekaligus)
          </button>
        </div>

        {/* Manual Period Settings Form (Developer, Kepala SPPG, Staff Only) */}
        {isEditingManualPeriod && canManagePeriod && (
          <form
            onSubmit={handleSaveManualPeriod}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 mb-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-[#024b3a]" />
                Penetapan Periode Kerja Manual
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase">
                {currentUser?.role}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nama Periode Kerja:
              </label>
              <input
                type="text"
                value={manualPeriodName}
                onChange={(e) => setManualPeriodName(e.target.value)}
                placeholder="Contoh: Periode Operasional Tahap 1"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tanggal Mulai:
                </label>
                <input
                  type="date"
                  value={manualStartDate}
                  onChange={(e) => setManualStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tanggal Selesai:
                </label>
                <input
                  type="date"
                  value={manualEndDate}
                  onChange={(e) => setManualEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Terakhir: {settings.workPeriodConfig?.lastUpdatedBy || '-'}
              </span>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#024b3a] hover:bg-[#023f31] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Periode</span>
              </button>
            </div>

            {manualSavedMsg && (
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Periode kerja manual berhasil diperbarui!</span>
              </div>
            )}
          </form>
        )}

        {/* Division Working Days Rule Note */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-[10px] text-amber-900 space-y-1 mb-4 leading-relaxed">
          <div className="font-extrabold flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Ketentuan Hari Masuk Divisi:</span>
          </div>
          <p>
            • <strong>Divisi Persiapan & Pengolahan:</strong> Mulai masuk hari <strong>Minggu</strong>.
          </p>
          <p>
            • <strong>Security:</strong> Masuk sampai hari <strong>Sabtu</strong> (Minggu Libur).
          </p>
          <p>
            • <strong>Divisi Lainnya:</strong> Mulai masuk hari <strong>Senin</strong>.
          </p>
        </div>

        {/* Month & Year Selectors */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-100/80 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#024b3a]/20"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs">
              ▼
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-100/80 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#024b3a]/20"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* User Selection List */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden mb-5 divide-y divide-slate-100 max-h-40 overflow-y-auto">
          <button
            type="button"
            onClick={() => setSelectedUser('ALL')}
            className={`w-full px-3.5 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors ${
              selectedUser === 'ALL'
                ? 'bg-slate-200 text-slate-900'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Semua Anggota Divisi</span>
            {selectedUser === 'ALL' && <Check className="w-3.5 h-3.5 text-slate-800" />}
          </button>

          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedUser(u.id)}
              className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                selectedUser === u.id
                  ? 'bg-slate-200 text-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="truncate pr-2">
                <span className="font-bold">{u.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5">
                  ({u.department || u.role})
                </span>
              </div>
              {selectedUser === u.id && <Check className="w-3.5 h-3.5 text-slate-800 shrink-0" />}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownload}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#024b3a] text-white font-bold text-xs shadow-md shadow-[#024b3a]/25 hover:bg-[#023f31] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Rekap Berhasil Diunduh!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>
                Unduh Spreadsheet CSV (
                {selectedPeriod === 'P1'
                  ? 'Periode 1'
                  : selectedPeriod === 'P2'
                  ? 'Periode 2'
                  : selectedPeriod === 'MANUAL'
                  ? 'Periode Manual'
                  : 'Sebulan'}
                )
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
