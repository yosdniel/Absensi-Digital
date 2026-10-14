import React from 'react';
import {
  Home,
  Clock,
  CalendarCheck,
  Shield,
  User,
  LogOut,
  Sparkles,
  Calendar,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  isDeveloperRole,
  isKepalaSPPGRole,
  isStaffRole,
  canDownloadRecap,
  canManageWorkingDays,
  canManageMembers,
  canManageRoles,
} from '../../types';

interface FullScreenLayoutProps {
  children: React.ReactNode;
  activeScreen: string;
  onNavigate: (screen: any) => void;
}

export const FullScreenLayout: React.FC<FullScreenLayoutProps> = ({
  children,
  activeScreen,
  onNavigate,
}) => {
  const { currentUser, logout, settings } = useApp();

  const isDev = isDeveloperRole(currentUser?.role);
  const isKepala = isKepalaSPPGRole(currentUser?.role);
  const isStaff = isStaffRole(currentUser?.role);
  const isPrivileged = isDev || isKepala || isStaff;

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col antialiased selection:bg-[#024b3a] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#024b3a] overflow-hidden flex items-center justify-center text-white shadow-md shadow-[#024b3a]/20 group-hover:scale-105 transition-transform text-lg">
              {settings.appIcon && settings.appIcon.startsWith('data:') ? (
                <img src={settings.appIcon} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                settings.appIcon || '🥗'
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-black text-[#024b3a] tracking-tight truncate max-w-[160px]">
                  {settings.appName || 'Hadir.in'}
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                  SPPG
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 truncate max-w-[180px]">
                {settings.name}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeScreen === 'dashboard'
                  ? 'bg-[#024b3a] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => onNavigate('attendance_history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeScreen === 'attendance_history'
                  ? 'bg-[#024b3a] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Riwayat Presensi
            </button>

            <button
              onClick={() => onNavigate('leave_history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeScreen === 'leave_history' || activeScreen === 'leave_form'
                  ? 'bg-[#024b3a] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Pengajuan Izin
            </button>

            <button
              onClick={() => onNavigate('profile_menu')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeScreen === 'profile_menu'
                  ? 'bg-[#024b3a] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Menu SPPG
            </button>

            {canManageMembers(currentUser?.role) && (
              <button
                onClick={() => onNavigate('member_list')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === 'member_list'
                    ? 'bg-[#024b3a] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Anggota & Registrasi
              </button>
            )}

            {canManageRoles(currentUser?.role) && (
              <button
                onClick={() => onNavigate('role_management')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === 'role_management'
                    ? 'bg-[#024b3a] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Kelola Jabatan
              </button>
            )}

            {canManageWorkingDays(currentUser?.role) && (
              <button
                onClick={() => onNavigate('working_days')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === 'working_days'
                    ? 'bg-[#024b3a] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Hari Kerja
              </button>
            )}
          </nav>

          {/* User Profile Pill & Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('edit_profile')}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-100/90 hover:bg-slate-200/80 transition-all border border-slate-200/50 cursor-pointer"
              title="Edit Profil"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                {currentUser?.facePhotoUrl ? (
                  <img
                    src={currentUser.facePhotoUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#024b3a]">
                    {currentUser?.name.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-[#024b3a] font-bold truncate">
                  {currentUser?.role}
                </div>
              </div>
            </button>

            <button
              onClick={logout}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Screen App Body */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-8">
        {children}
      </main>


      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-lg">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center justify-center transition-all ${
              activeScreen === 'dashboard'
                ? 'text-[#024b3a]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">Beranda</span>
          </button>

          <button
            onClick={() => onNavigate('attendance_history')}
            className={`flex flex-col items-center justify-center transition-all ${
              activeScreen === 'attendance_history'
                ? 'text-[#024b3a]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Clock className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">Riwayat</span>
          </button>

          <button
            onClick={() => onNavigate('leave_history')}
            className={`flex flex-col items-center justify-center transition-all ${
              activeScreen === 'leave_history' || activeScreen === 'leave_form'
                ? 'text-[#024b3a]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">Izin</span>
          </button>

          <button
            onClick={() => onNavigate('profile_menu')}
            className={`flex flex-col items-center justify-center transition-all ${
              activeScreen === 'profile_menu'
                ? 'text-[#024b3a]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">Menu</span>
          </button>

          <button
            onClick={() => onNavigate('edit_profile')}
            className={`flex flex-col items-center justify-center transition-all ${
              activeScreen === 'edit_profile'
                ? 'text-[#024b3a]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">Profil</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="py-6 text-center text-[11px] text-slate-400 mt-auto pb-20 md:pb-6">
        ©2026 <strong className="font-bold text-slate-700">Mindspace Studio</strong>
      </footer>
    </div>
  );
};
