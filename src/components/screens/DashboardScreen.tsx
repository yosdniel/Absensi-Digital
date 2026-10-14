import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  X,
  Megaphone,
  UserCheck,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { useApp, formatIndonesianDate } from '../../context/AppContext';
import { canMakeAnnouncement, getUserSchedule, WarningLetter } from '../../types';
import { SoftNotificationBanner } from '../common/SoftNotificationBanner';
import { WarningLetterModal } from '../common/WarningLetterModal';

interface DashboardScreenProps {
  onOpenProfile: () => void;
  onOpenFaceRegistration: () => void;
  onStartAttendance: (type: 'MASUK' | 'PULANG') => void;
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onOpenProfile,
  onOpenFaceRegistration,
  onStartAttendance,
  onNavigate,
}) => {
  const {
    currentUser,
    settings,
    attendance,
    announcements,
    divisionSchedules,
    warningLetters,
    isTodayWorkingDay,
    addAnnouncement,
    roles,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewingSP, setViewingSP] = useState<WarningLetter | null>(null);

  // Announcement modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'NORMAL' | 'PENTING'>('NORMAL');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  const currentHour = currentTime.getHours();
  let greeting = 'Selamat Sore';
  if (currentHour >= 4 && currentHour < 11) greeting = 'Selamat Pagi';
  else if (currentHour >= 11 && currentHour < 15) greeting = 'Selamat Siang';
  else if (currentHour >= 15 && currentHour < 18) greeting = 'Selamat Sore';
  else greeting = 'Selamat Malam';

  const dateFormatted = formatIndonesianDate(currentTime);
  const isWorkingDay = isTodayWorkingDay();

  // User's division schedule
  const userSchedule = getUserSchedule(currentUser, divisionSchedules, settings);

  // Active warning letters for this user
  const activeUserSP = warningLetters.find(
    (l) => l.userId === currentUser?.id && l.status === 'Aktif'
  );

  // Find coordinator for current user
  const currentRoleDef = roles.find((r) => r.name === currentUser?.role);
  const coordinatorTitle = currentRoleDef?.coordinatorRole || 'Staff';

  // Today's attendance
  const todayRecords = attendance.filter((a) => a.userId === currentUser?.id);
  const masukRecord = todayRecords.find((a) => a.type === 'MASUK');
  const pulangRecord = todayRecords.find((a) => a.type === 'PULANG');

  const canPostAnn = canMakeAnnouncement(currentUser?.role);

  const handleAttendanceClick = (type: 'MASUK' | 'PULANG') => {
    if (!currentUser?.faceRegistered) {
      onOpenFaceRegistration();
      return;
    }
    onStartAttendance(type);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      priority: annPriority,
    });

    setAnnTitle('');
    setAnnContent('');
    setShowAnnModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 select-none">
      {/* Top Greeting & User Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-400">
              {greeting}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentUser?.name || 'Pengguna'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {currentUser?.department} • <span className="font-bold text-[#024b3a]">{currentUser?.role}</span>
          </p>
        </div>

        <button
          onClick={onOpenProfile}
          className="w-13 h-13 rounded-2xl bg-white shadow-sm border border-slate-200/60 flex items-center justify-center p-0.5 hover:ring-2 hover:ring-[#024b3a]/30 active:scale-95 transition-all overflow-hidden cursor-pointer"
          title="Buka Menu Profil"
        >
          {currentUser?.facePhotoUrl ? (
            <img
              src={currentUser.facePhotoUrl}
              alt={currentUser.name}
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-emerald-50 text-[#024b3a] font-extrabold flex items-center justify-center text-lg">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
          )}
        </button>
      </div>

      {/* Soft Notification Banner: triggers if user hasn't checked in by scheduled start time */}
      <SoftNotificationBanner onStartAttendance={() => handleAttendanceClick('MASUK')} />

      {/* Active Surat Peringatan (SP) Alert for Employee */}
      {activeUserSP && (
        <div
          onClick={() => setViewingSP(activeUserSP)}
          className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 shadow-sm flex items-center justify-between cursor-pointer hover:bg-rose-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              {activeUserSP.level}
            </div>
            <div>
              <div className="text-xs font-extrabold flex items-center gap-1.5 text-rose-950">
                <span>Surat Peringatan Aktif: {activeUserSP.reasonCategory}</span>
              </div>
              <div className="text-[11px] text-rose-700">
                No: {activeUserSP.letterNumber} • Berlaku s/d {activeUserSP.validUntil}. Klik untuk lihat dokumen resmi.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-rose-700 shrink-0">
            <span>Lihat SP</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Working Day Status Banner */}
      {!isWorkingDay ? (
        <div className="p-4 rounded-3xl bg-amber-500 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-sm font-extrabold">Hari Ini: Hari Libur Operasional</div>
              <div className="text-xs text-white/90">Tidak ada kewajiban presensi masuk hari ini.</div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase">
            Libur
          </span>
        </div>
      ) : (
        <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Hari Kerja Aktif SPPG</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Koordinator Pembina: <strong className="text-slate-800">{coordinatorTitle}</strong>
          </span>
        </div>
      )}

      {/* Warning Banner: Wajah Belum Terdaftar */}
      {!currentUser?.faceRegistered && (
        <div
          onClick={onOpenFaceRegistration}
          className="p-4 rounded-3xl bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 flex items-center gap-3.5 cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold tracking-tight">
              Biometrik Wajah Belum Terdaftar
            </h2>
            <p className="text-xs text-white/90 font-medium truncate">
              Klik untuk rekam wajah agar dapat melakukan presensi kehadiran.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
        </div>
      )}

      {/* Digital Clock Card */}
      <div className="w-full rounded-3xl p-6 sm:p-8 bg-linear-to-br from-[#0c5c63] via-[#143d7c] to-[#452796] text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center py-2 sm:py-4">
          <div className="flex items-baseline justify-center">
            <span className="text-6xl sm:text-7xl font-black tracking-tight drop-shadow-sm font-mono">
              {hours}:{minutes}
            </span>
            <span className="text-2xl sm:text-3xl font-bold ml-2 opacity-80 font-mono">
              {seconds}
            </span>
          </div>

          <div className="w-full max-w-sm h-px bg-white/20 my-4" />

          <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/95">
            <Calendar className="w-4 h-4 opacity-80" />
            <span>{dateFormatted}</span>
          </div>
        </div>
      </div>

      {/* Office & Geofence Status Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Radius Geofence Kantor</div>
            <div className="text-xs font-bold text-slate-900 truncate">{settings.name}</div>
            <div className="text-[11px] text-emerald-700 font-semibold">Aktif • Maksimal {settings.radius} Meter</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase truncate">
              Jadwal {userSchedule.divisionName}
            </div>
            <div className="text-xs font-bold text-slate-900 font-mono">
              {userSchedule.jamMasuk} - {userSchedule.jamPulang} WIB
            </div>
            <div className="text-[11px] text-amber-700 font-semibold">
              Batas: {userSchedule.batasJamMasuk} WIB (+{userSchedule.toleransiMenit} mnt)
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Action Buttons */}
      <div className="w-full">
        {!masukRecord ? (
          <button
            onClick={() => handleAttendanceClick('MASUK')}
            className="w-full py-4 px-6 rounded-2xl bg-[#024b3a] text-white font-bold text-base shadow-lg shadow-[#024b3a]/25 hover:bg-[#023f31] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            <span>Absen Masuk</span>
          </button>
        ) : !pulangRecord ? (
          <button
            onClick={() => handleAttendanceClick('PULANG')}
            className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-red-600 to-rose-600 text-white font-bold text-base shadow-lg shadow-rose-600/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            <span>Absen Pulang (Masuk pukul {masukRecord.timeStr})</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center font-bold text-xs flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Presensi Hari Ini Selesai (Masuk: {masukRecord.timeStr} • Pulang: {pulangRecord.timeStr})</span>
          </div>
        )}
      </div>

      {/* Quick link to Attendance History */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="text-slate-400 font-medium">Status & Log Harian</span>
        <button
          onClick={() => onNavigate('attendance_history')}
          className="text-[#024b3a] font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Buka Panel Riwayat Absensi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Broadcast Pengumuman Instansi */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#024b3a]" />
            <span>Pengumuman Internal SPPG</span>
          </h3>

          {canPostAnn && (
            <button
              onClick={() => setShowAnnModal(true)}
              className="text-xs font-bold text-[#024b3a] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Pengumuman</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {announcements
            .filter((ann) => {
              if (ann.priority === 'PENTING') return true;
              // For NORMAL priority: max 14 days old
              try {
                // Parses dates like "14 Apr 2026", "14 Okt 2026"
                const indonesianMonths: Record<string, string> = {
                  Jan: '01', Feb: '02', Mar: '03', Apr: '04', Mei: '05', Jun: '06',
                  Jul: '07', Agu: '08', Sep: '09', Okt: '10', Nov: '11', Des: '12',
                };
                const parts = ann.date.split(' ');
                if (parts.length === 3) {
                  const day = parts[0].padStart(2, '0');
                  const month = indonesianMonths[parts[1]] || '01';
                  const year = parts[2];
                  const annDate = new Date(`${year}-${month}-${day}`).getTime();
                  if (!isNaN(annDate)) {
                    const diffDays = (Date.now() - annDate) / (1000 * 60 * 60 * 24);
                    return diffDays <= 14;
                  }
                }
              } catch {
                // keep if cannot parse
              }
              return true;
            })
            .slice(0, 5)
            .map((ann) => (
            <div
              key={ann.id}
              className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">
                  {ann.title}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ann.priority === 'PENTING'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {ann.date}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {ann.content}
              </p>
              <div className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-50">
                Oleh: <strong className="text-slate-700">{ann.authorName}</strong> ({ann.authorRole})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                Buat Pengumuman Internal
              </h3>
              <button
                onClick={() => setShowAnnModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Kedatangan Bahan Baku"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prioritas
                </label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as 'NORMAL' | 'PENTING')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="PENTING">Penting (Highlight Merah)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi Pesan Pengumuman *
                </label>
                <textarea
                  rows={3}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Tuliskan pesan instruksi untuk seluruh tim SPPG..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:outline-hidden resize-none font-medium leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#024b3a] text-white text-xs font-bold shadow-md hover:bg-[#023f31] cursor-pointer"
                >
                  Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Surat Peringatan */}
      <WarningLetterModal
        isOpen={Boolean(viewingSP)}
        letter={viewingSP}
        onClose={() => setViewingSP(null)}
      />
      
    </div>
  );
};
