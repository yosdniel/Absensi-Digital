import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, ArrowRight, Volume2, ShieldAlert, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getUserSchedule } from '../../types';

interface SoftNotificationBannerProps {
  onStartAttendance: () => void;
}

export const SoftNotificationBanner: React.FC<SoftNotificationBannerProps> = ({
  onStartAttendance,
}) => {
  const {
    currentUser,
    attendance,
    divisionSchedules,
    settings,
    isTodayWorkingDay,
    playSoftNotificationChime,
    triggerLocalPushNotification,
  } = useApp();

  const [isDismissed, setIsDismissed] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [hasAlertedInSession, setHasAlertedInSession] = useState(false);

  // Check if today is a working day
  const workingDay = isTodayWorkingDay();

  // Check if user has already checked in today
  const hasCheckedInToday = attendance.some(
    (a) => a.userId === currentUser?.id && a.type === 'MASUK'
  );

  // Resolve user's scheduled working hours (division-based)
  const schedule = getUserSchedule(currentUser, divisionSchedules, settings);

  // Parse schedule hours and minutes
  const [schedHours, schedMinutes] = (schedule.jamMasuk || '07:00')
    .split(':')
    .map(Number);
  const scheduledTimeInMinutes = (schedHours || 7) * 60 + (schedMinutes || 0);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Should trigger if:
  // 1. It is a working day
  // 2. User has NOT checked in yet
  // 3. Current time is >= scheduled start time (or within 30 minutes before start time)
  const isPastStartTime = currentMinutes >= scheduledTimeInMinutes;
  const isNearOrPast = currentMinutes >= scheduledTimeInMinutes - 30; // 30 min warm-up
  const shouldAlert = workingDay && !hasCheckedInToday && isNearOrPast;

  // Trigger local push notification & sound chime on initial condition met
  useEffect(() => {
    if (shouldAlert && !hasAlertedInSession && !hasCheckedInToday) {
      setHasAlertedInSession(true);

      // Play soft melodic chime
      playSoftNotificationChime();

      // Trigger local browser push notification
      const bodyText = `Halo ${currentUser?.name || 'Karyawan'}, jadwal masuk ${schedule.divisionName} (${schedule.jamMasuk} WIB) telah tiba. Anda belum melakukan Absen Masuk.`;
      triggerLocalPushNotification('Hadir.in SPPG - Waktunya Absen Masuk!', bodyText);
    }
  }, [shouldAlert, hasAlertedInSession, hasCheckedInToday]);

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        playSoftNotificationChime();
        triggerLocalPushNotification(
          'Hadir.in SPPG - Notifikasi Aktif',
          'Notifikasi pengingat jadwal jam kerja lokal berhasil diaktifkan!'
        );
      }
    }
  };

  // If already checked in or not working day or no alert needed
  if (!shouldAlert || hasCheckedInToday) {
    return null;
  }

  // If user dismissed it to a floating compact indicator
  if (isDismissed) {
    return (
      <div className="fixed bottom-24 right-4 z-40 animate-in fade-in slide-in-from-bottom-2">
        <button
          onClick={() => setIsDismissed(false)}
          className="px-3.5 py-2 rounded-2xl bg-amber-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-amber-600 transition-all cursor-pointer"
        >
          <Bell className="w-4 h-4 animate-bounce" />
          <span>Pengingat Absen: {schedule.jamMasuk} WIB</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-5 sm:p-6 shadow-xl shadow-amber-500/20 space-y-3.5 select-none animate-in fade-in duration-300">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
            <Bell className="w-6 h-6 text-white animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                Peringatan Jadwal Masuk
              </span>
              <span className="text-xs font-mono font-bold text-white/90">
                {isPastStartTime ? 'Waktu Tiba' : 'Mendekati Jadwal'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
              Anda Belum Absen Masuk Hari Ini
            </h3>

            <p className="text-xs text-white/90 leading-relaxed font-medium max-w-xl">
              Jadwal operasional <strong>{schedule.divisionName}</strong> dimulai pukul{' '}
              <strong className="underline decoration-white/50">{schedule.jamMasuk} WIB</strong>{' '}
              (Batas: {schedule.batasJamMasuk} WIB, toleransi +{schedule.toleransiMenit} menit).
              Segera lakukan presensi biometrik wajah Anda di kantor SPPG.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Tutup Notifikasi Sementara"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/20 relative z-10">
        <div className="flex items-center gap-2">
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestPushPermission}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>Aktifkan Push Notifikasi</span>
            </button>
          )}

          <button
            onClick={playSoftNotificationChime}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Tes Bunyi Peringatan Halus"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tes Nada</span>
          </button>
        </div>

        <button
          onClick={onStartAttendance}
          className="px-5 py-2.5 rounded-xl bg-white text-amber-900 font-black text-xs shadow-md hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer ml-auto"
        >
          <span>Absen Masuk Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
