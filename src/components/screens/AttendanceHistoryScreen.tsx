import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  User,
  Download,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import {
  AttendanceRecord,
  canViewAllAttendance,
  canDownloadRecap,
} from '../../types';

interface AttendanceHistoryScreenProps {
  onBack: () => void;
  onOpenPhotoProof: (record: AttendanceRecord) => void;
  onOpenRecapModal: () => void;
}

export const AttendanceHistoryScreen: React.FC<AttendanceHistoryScreenProps> = ({
  onBack,
  onOpenPhotoProof,
  onOpenRecapModal,
}) => {
  const { currentUser, attendance, users, substituteAssignments } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MASUK' | 'PULANG'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TEPAT_WAKTU' | 'TERLAMBAT'>('ALL');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');

  const canViewAll = canViewAllAttendance(currentUser?.role);
  const canDownload = canDownloadRecap(currentUser?.role);

  // 14 days cutoff in milliseconds
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

  // Filter attendance records according to user requirement:
  // 1. Developer, Kepala SPPG, and Staff: view all users
  // 2. Koordinator & Divisi biasa: view only their own records, maximum 14 days back
  const filteredAttendance = attendance.filter((rec) => {
    if (!canViewAll) {
      // Must be own record
      if (rec.userId !== currentUser?.id) return false;

      // Maximum 14 days back
      const recordTime = new Date(rec.timestamp).getTime();
      if (!isNaN(recordTime) && recordTime < fourteenDaysAgo) {
        return false;
      }
    } else {
      // Admin filter by user if selected
      if (selectedUserFilter !== 'ALL' && rec.userId !== selectedUserFilter) {
        return false;
      }
    }

    // Type filter
    if (typeFilter !== 'ALL' && rec.type !== typeFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && rec.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        rec.userName.toLowerCase().includes(q) ||
        rec.userId.toLowerCase().includes(q) ||
        (rec.userRole && rec.userRole.toLowerCase().includes(q)) ||
        (rec.department && rec.department.toLowerCase().includes(q)) ||
        rec.dateStr.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Calculate stats for current view
  const totalCount = filteredAttendance.length;
  const onTimeCount = filteredAttendance.filter((r) => r.status === 'TEPAT_WAKTU').length;
  const lateCount = filteredAttendance.filter((r) => r.status === 'TERLAMBAT').length;

  // Generate last 7 days data for Recharts weekly trend
  const chartData = React.useMemo(() => {
    const daysMap = new Map<string, { date: string; tepatWaktu: number; terlambat: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      daysMap.set(dateStr, { date: dateStr, tepatWaktu: 0, terlambat: 0 });
    }

    filteredAttendance.forEach((rec) => {
      const recDate = new Date(rec.timestamp);
      if (!isNaN(recDate.getTime())) {
        const dateStr = recDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (daysMap.has(dateStr)) {
          const entry = daysMap.get(dateStr)!;
          if (rec.status === 'TEPAT_WAKTU') {
            entry.tepatWaktu += 1;
          } else if (rec.status === 'TERLAMBAT') {
            entry.terlambat += 1;
          }
        }
      }
    });

    return Array.from(daysMap.values());
  }, [filteredAttendance]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 select-none">
      <Header
        title="Riwayat Presensi Absensi"
        onBack={onBack}
        rightAction={
          canDownload ? (
            <button
              onClick={onOpenRecapModal}
              className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-slate-200/60 flex items-center justify-center text-[#024b3a] hover:bg-slate-50 transition-transform active:scale-95 cursor-pointer"
              title="Unduh Rekap Spreadsheet"
            >
              <Download className="w-5 h-5" />
            </button>
          ) : undefined
        }
      />

      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
            <span className="block text-[11px] font-bold text-slate-400 mb-1">Presensi Hari Ini</span>
            <span className="text-xl font-black text-slate-900">85%</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
            <span className="block text-[11px] font-bold text-slate-400 mb-1">Menunggu Persetujuan</span>
            <span className="text-xl font-black text-slate-900">3</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs">
            <span className="block text-[11px] font-bold text-slate-400 mb-1">Cuti / Izin</span>
            <span className="text-xl font-black text-slate-900">2</span>
          </div>
        </div>

        {/* Role Access Scope Info Banner */}
        {canViewAll ? (
          <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#024b3a] shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Mode Pengawasan ({currentUser?.role}): Riwayat Seluruh Anggota
                </div>
                <div className="text-[11px] text-slate-500">
                  Menampilkan seluruh data log kehadiran karyawan SPPG.
                </div>
              </div>
            </div>

            <button
              onClick={onOpenRecapModal}
              className="px-3 py-1.5 rounded-xl bg-[#024b3a] text-white text-xs font-bold shadow-xs hover:bg-[#023f31] flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Rekap</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-3xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs text-blue-950 leading-relaxed">
              <span className="font-bold">Riwayat Presensi Pribadi ({currentUser?.name}):</span> Menampilkan catatan kehadiran maksimal <strong>14 hari kebelakang</strong>.
            </div>
          </div>
        )}

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs text-center">
            <span className="block text-[11px] text-slate-400 font-semibold mb-0.5">Total Presensi</span>
            <span className="text-lg font-black text-slate-900">{totalCount}</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs text-center">
            <span className="block text-[11px] text-emerald-600 font-semibold mb-0.5">Tepat Waktu</span>
            <span className="text-lg font-black text-emerald-700">{onTimeCount}</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs text-center">
            <span className="block text-[11px] text-red-600 font-semibold mb-0.5">Terlambat</span>
            <span className="text-lg font-black text-red-600">{lateCount}</span>
          </div>
        </div>

        {/* Recharts Weekly Trend Visualization */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Tren Kehadiran Mingguan
              </h3>
              <p className="text-[11px] text-slate-400">
                Statistik presensi tepat waktu vs terlambat (7 hari terakhir)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold">
              Recharts Visualisasi
            </span>
          </div>

          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="tepatWaktu" name="Tepat Waktu" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="terlambat" name="Terlambat" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-3">
          {/* Search bar */}
          <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-3.5 py-2.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, ID, divisi, tanggal..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Filter Pills Type */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === 'ALL'
                    ? 'bg-[#024b3a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setTypeFilter('MASUK')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === 'MASUK'
                    ? 'bg-[#024b3a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setTypeFilter('PULANG')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === 'PULANG'
                    ? 'bg-[#024b3a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pulang
              </button>
            </div>

            {/* Filter Status (Tepat Waktu / Terlambat) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Status: Semua
              </button>
              <button
                onClick={() => setStatusFilter('TEPAT_WAKTU')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'TEPAT_WAKTU'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-emerald-700 hover:bg-slate-200'
                }`}
              >
                Tepat Waktu
              </button>
              <button
                onClick={() => setStatusFilter('TERLAMBAT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'TERLAMBAT'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-red-600 hover:bg-slate-200'
                }`}
              >
                Terlambat
              </button>
            </div>
          </div>

          {/* Member Selector (for Developer, Kepala SPPG, and Staff only) */}
          {canViewAll && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Filter Berdasarkan Anggota:
              </label>
              <div className="relative">
                <select
                  value={selectedUserFilter}
                  onChange={(e) => setSelectedUserFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 appearance-none focus:outline-hidden"
                >
                  <option value="ALL">Semua Anggota SPPG</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role} - {u.department})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List of Attendance Cards */}
        <div className="space-y-3">
          {filteredAttendance.length === 0 ? (
            <div className="p-10 bg-white rounded-3xl border border-slate-100 text-center text-xs text-slate-400 shadow-2xs">
              Tidak ada catatan riwayat absensi yang sesuai filter.
            </div>
          ) : (
            filteredAttendance.map((rec) => {
              const isMasuk = rec.type === 'MASUK';
              const isLate = rec.status === 'TERLAMBAT';

              return (
                <div
                  key={rec.id}
                  className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon indicator */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                        isMasuk
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {isMasuk ? '→' : '←'}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Absen {isMasuk ? 'Masuk' : 'Pulang'} • {rec.timeStr}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {rec.dateStr}
                        </span>
                      </div>

                      {/* User Info (prominent in all-user view) */}
                      <div className="text-xs text-slate-600 font-medium">
                        <strong className="text-slate-900">{rec.userName}</strong>
                        {rec.userRole && (
                          <span className="text-[#024b3a] font-bold"> • {rec.userRole}</span>
                        )}
                        {rec.department && (
                          <span className="text-slate-400"> ({rec.department})</span>
                        )}
                      </div>

                      {/* Distance info */}
                      <div className="text-[11px] text-slate-400 font-mono">
                        Radius: {rec.distanceMeters}m dari kantor ({rec.withinRadius ? 'Dalam Area' : 'Luar Area'})
                      </div>
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    {/* Photo button */}
                    {rec.photoUrl && (
                      <button
                        onClick={() => onOpenPhotoProof(rec)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Lihat Foto Bukti"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Foto</span>
                      </button>
                    )}

                    {/* Status badge */}
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                        isLate
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isLate ? 'Terlambat' : 'Tepat Waktu'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Substitute History Section */}
      {substituteAssignments.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Riwayat Karyawan Pengganti
          </h3>
          <div className="space-y-2">
            {substituteAssignments.map((sub) => (
              <div key={sub.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{sub.substituteName} (Pengganti)</div>
                  <div className="text-[11px] text-slate-500">
                    Menggantikan: <span className="font-semibold text-slate-700">{sub.originalUserName}</span> • {sub.division}
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-400">{sub.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
