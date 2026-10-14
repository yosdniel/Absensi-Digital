import React, { useEffect } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  Radio,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PushNotificationBanner: React.FC = () => {
  const { activePushBanner, dismissPushBanner } = useApp();

  useEffect(() => {
    if (!activePushBanner) return;
    // Auto dismiss after 7 seconds if not urgent
    if (activePushBanner.priority !== 'URGENT') {
      const timer = setTimeout(() => {
        dismissPushBanner();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activePushBanner, dismissPushBanner]);

  if (!activePushBanner) return null;

  const isUrgent = activePushBanner.priority === 'URGENT';
  const isPenting = activePushBanner.priority === 'PENTING';

  return (
    <div className="fixed top-3 inset-x-3 z-50 max-w-md mx-auto animate-in slide-in-from-top-4 duration-300">
      <div
        className={`p-4 rounded-3xl shadow-2xl border backdrop-blur-md flex items-start gap-3 text-xs ${
          isUrgent
            ? 'bg-rose-950/95 text-white border-rose-500 shadow-rose-900/30'
            : isPenting
            ? 'bg-slate-900/95 text-white border-amber-500 shadow-amber-900/20'
            : 'bg-slate-900/95 text-white border-slate-700'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
            isUrgent
              ? 'bg-rose-600 text-white animate-bounce'
              : isPenting
              ? 'bg-amber-500 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5 animate-pulse" />
          )}
        </div>

        <div className="flex-1 space-y-1 pr-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-black text-xs tracking-tight line-clamp-1">
              {activePushBanner.title}
            </span>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 ${
                isUrgent
                  ? 'bg-rose-500 text-white'
                  : isPenting
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {activePushBanner.targetDivision === 'ALL'
                ? 'Semua Divisi'
                : activePushBanner.targetDivision}
            </span>
          </div>

          <p className="text-[11px] text-slate-200 leading-relaxed line-clamp-3 font-medium">
            {activePushBanner.message}
          </p>

          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
            <span>Dari: {activePushBanner.senderName} ({activePushBanner.senderRole})</span>
            <span>{activePushBanner.timeStr}</span>
          </div>
        </div>

        <button
          onClick={dismissPushBanner}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white shrink-0 cursor-pointer transition-colors"
          title="Tutup Notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
