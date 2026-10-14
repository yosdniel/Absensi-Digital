import React, { useState } from 'react';
import {
  LogOut,
  Camera,
  CalendarDays,
  Download,
  Clock,
  PhoneCall,
  Sliders,
  MapPin,
  Users,
  CalendarCheck,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Smile,
  Filter,
  Edit,
  Shield,
  KeyRound,
  Calendar,
  Lock,
  Megaphone,
  ShieldAlert,
  MessageSquare,
} from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import {
  AttendanceRecord,
  isDeveloperRole,
  isKepalaSPPGRole,
  isStaffRole,
  canDownloadRecap,
  canMakeAnnouncement,
  canViewAllAttendance,
  canManageLocation,
  canManageWorkingHours,
  canIssueWarningLetter,
} from '../../types';

interface ProfileMenuScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onOpenRecapModal: () => void;
  onOpenPhotoProof: (record: AttendanceRecord) => void;
  onContactAdmin: () => void;
}

export const ProfileMenuScreen: React.FC<ProfileMenuScreenProps> = ({
  onBack,
  onNavigate,
  onOpenRecapModal,
  onOpenPhotoProof,
  onContactAdmin,
}) => {
  const { currentUser, users, attendance, logout, settings, updateSettings } = useApp();

  const isDev = isDeveloperRole(currentUser?.role);
  const isKepala = isKepalaSPPGRole(currentUser?.role);
  const isStaff = isStaffRole(currentUser?.role);
  const canDownload = canDownloadRecap(currentUser?.role);

  const totalMembers = users.length;
  const faceOkCount = users.filter((u) => u.faceRegistered).length;
  const phoneOkCount = users.filter((u) => u.phoneRegistered).length;

  const handleDownloadClick = () => {
    if (!canDownload) {
      alert(`Akses Ditolak: Fitur unduh rekap absensi hanya dapat diakses oleh Developer, Kepala SPPG, dan Staff. Jabatan Anda saat ini: ${currentUser?.role}`);
      return;
    }
    onOpenRecapModal();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 select-none">
      <Header title="Profil & Menu Navigasi" onBack={onBack} />

      <div className="space-y-6">
        {/* User Card with Dark Indigo Gradient */}
        <div className="w-full rounded-3xl p-6 bg-linear-to-r from-[#0a4854] to-[#1a376f] text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {currentUser?.facePhotoUrl ? (
                  <img
                    src={currentUser.facePhotoUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-8 h-8 text-white/90" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  {currentUser?.name}
                </h2>
                <p className="text-xs text-white/70 font-mono mt-0.5">
                  ID: {currentUser?.id} • Divisi: {currentUser?.department}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wide uppercase">
                    {currentUser?.role}
                  </span>
                  <button
                    onClick={() => onNavigate('edit_profile')}
                    className="px-2.5 py-0.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 text-[10px] font-bold tracking-wide flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit className="w-2.5 h-2.5" />
                    <span>Edit Profil</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-colors cursor-pointer"
              title="Keluar Akun"
            >
              <LogOut className="w-5 h-5 text-white/90" />
            </button>
          </div>
        </div>

        {/* Developer Android App & Icon Customization Card (Strictly Developer) */}
        {isDev && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Ubah Nama & Ikon Aplikasi Android (Khusus Developer)
                </h3>
                <p className="text-xs text-slate-500">
                  Pengaturan eksklusif Developer untuk mengubah branding nama aplikasi dan ikon utama
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Aplikasi Android:
                </label>
                <input
                  type="text"
                  value={settings.appName || 'Hadir.in'}
                  onChange={(e) => updateSettings({ appName: e.target.value })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden"
                  placeholder="Hadir.in"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Logo / Ikon Aplikasi (File Galeri):
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {settings.appIcon && settings.appIcon.startsWith('data:') ? (
                      <img src={settings.appIcon} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base">{settings.appIcon || '🥗'}</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            updateSettings({ appIcon: ev.target.result as string });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#024b3a] file:text-white hover:file:bg-[#023b2d] cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Perubahan nama aplikasi dan ikon akan langsung diterapkan pada header aplikasi.
            </p>
          </div>
        )}

        {/* Admin Stats Cards */}
        {(isDev || isKepala) && (
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Statistik Personel SPPG
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-slate-800">{totalMembers}</span>
                <span className="text-[11px] text-slate-400 font-medium">Anggota</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                  <Smile className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-slate-800">{faceOkCount}</span>
                <span className="text-[11px] text-slate-400 font-medium">Wajah OK</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-slate-800">{phoneOkCount}</span>
                <span className="text-[11px] text-slate-400 font-medium">HP OK</span>
              </div>
            </div>
          </div>
        )}

        {/* Menu Navigasi Grid */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">
            Menu Operasional
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {/* Edit Profil */}
            <button
              onClick={() => onNavigate('edit_profile')}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2 shadow-2xs">
                <Edit className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                Edit<br />Profil
              </span>
            </button>

            {/* Daftar Wajah */}
            <button
              onClick={() => onNavigate('face_registration')}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2 shadow-2xs">
                <Camera className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                Daftar<br />Wajah
              </span>
            </button>

            {/* Pengajuan Izin */}
            <button
              onClick={() => onNavigate('leave_form')}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2 shadow-2xs">
                <CalendarDays className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                Pengajuan<br />Izin (1 Hari)
              </span>
            </button>

            {/* Download Rekap (Strict Role Protection!) */}
            <button
              onClick={handleDownloadClick}
              className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center transition-all cursor-pointer ${
                canDownload ? 'hover:bg-slate-50 active:scale-95' : 'opacity-70'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-2xs relative ${
                canDownload ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                <Download className="w-6 h-6 stroke-[1.8]" />
                {!canDownload && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                Download<br />Rekap {!canDownload && <span className="text-[10px] text-slate-400 block font-normal">(Terkunci)</span>}
              </span>
            </button>

            {/* Riwayat Presensi Absensi (Dedicated Panel) */}
            <button
              onClick={() => onNavigate('attendance_history')}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#024b3a] flex items-center justify-center mb-2 shadow-2xs">
                <Clock className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                Riwayat<br />Presensi
              </span>
            </button>

            {/* Riwayat Izin */}
            <button
              onClick={() => onNavigate('leave_history')}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2 shadow-2xs">
                <CalendarCheck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                Riwayat<br />Izin
              </span>
            </button>

            {/* Livechat & Pengajuan Izin */}
            <button
              onClick={() => onNavigate('live_chat')}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
                <MessageSquare className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                Livechat<br />Koordinasi
              </span>
            </button>


            {/* Developer / Kepala SPPG Member Management */}
            {(isDev || isKepala) && (
              <button
                onClick={() => onNavigate('member_list')}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2 shadow-2xs">
                  <Users className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  Daftar<br />Anggota
                </span>
              </button>
            )}

            {/* Shift Management (Dev & Kepala SPPG & Staff) */}
            {(isDev || isKepala || isStaff) && (
              <>
                <button
                  onClick={() => onNavigate('shift_management')}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 shadow-2xs">
                    <Clock className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Manajemen<br />Shift
                  </span>
                </button>

                {/* Update Lokasi & Nama SPPG */}
                <button
                  onClick={() => onNavigate('location_settings')}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-2 shadow-2xs">
                    <MapPin className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Lokasi &<br />Nama SPPG
                  </span>
                </button>
              </>
            )}

            {/* Developer Only Items */}
            {isDev && (
              <>
                {/* Kelola Jabatan */}
                <button
                  onClick={() => onNavigate('role_management')}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2 shadow-2xs">
                    <Shield className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Kelola<br />Jabatan
                  </span>
                </button>

                {/* Atur Hari Kerja */}
                <button
                  onClick={() => onNavigate('working_days')}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-2 shadow-2xs">
                    <Calendar className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Atur Hari<br />Kerja
                  </span>
                </button>

                {/* Pengaturan Jam Kerja & Toleransi */}
                <button
                  onClick={() => onNavigate('working_hours')}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col items-center text-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2 shadow-2xs">
                    <Sliders className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Jam Kerja &<br />Toleransi
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Panel Riwayat Presensi Shortcut Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#024b3a] flex items-center justify-center font-bold">
                <Clock className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Panel Riwayat Presensi
                </h3>
                <p className="text-xs text-slate-500">
                  {canViewAllAttendance(currentUser?.role)
                    ? 'Monitoring log presensi seluruh anggota tim SPPG'
                    : 'Catatan presensi pribadi (maksimal 14 hari terakhir)'}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#024b3a] text-xs font-extrabold border border-emerald-100">
              {attendance.length} Log Total
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">
                {canViewAllAttendance(currentUser?.role)
                  ? 'Akses Supervisi Aktif'
                  : 'Akses Karyawan Mandiri'}:
              </span>{' '}
              {canViewAllAttendance(currentUser?.role)
                ? 'Sebagai Developer / Kepala SPPG / Staff, Anda dapat memantau, mencari, menyaring, dan mengunduh seluruh data riwayat absensi seluruh anggota SPPG.'
                : 'Menampilkan riwayat presensi masuk dan pulang Anda dengan rentang maksimal 14 hari kebelakang.'}
            </div>

            <button
              onClick={() => onNavigate('attendance_history')}
              className="px-5 py-2.5 rounded-xl bg-[#024b3a] text-white font-bold text-xs shadow-md shadow-[#024b3a]/20 hover:bg-[#023f31] active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Buka Panel Riwayat</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 pb-2 text-center text-slate-400">
          <p className="text-[11px] text-slate-400">
            &copy;2026 <strong className="font-bold text-slate-600">Mindspace Studio</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
