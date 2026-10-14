import React, { useState } from 'react';
import {
  Bell,
  X,
  Trash2,
  Check,
  AlertTriangle,
  Radio,
  Users,
  Smartphone,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  isDeveloperRole,
  isKepalaSPPGRole,
  isStaffRole,
} from '../../types';

interface NotificationInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreatePush?: () => void;
}

export const NotificationInboxModal: React.FC<NotificationInboxModalProps> = ({
  isOpen,
  onClose,
  onOpenCreatePush,
}) => {
  const {
    currentUser,
    pushNotifications,
    markPushNotificationAsRead,
    deletePushNotification,
  } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'MY_DIVISION'>('ALL');

  if (!isOpen) return null;

  const isDev = isDeveloperRole(currentUser?.role);
  const isKepala = isKepalaSPPGRole(currentUser?.role);
  const isStaff = isStaffRole(currentUser?.role);
  const canBroadcast = isDev || isKepala || isStaff;

  const userDivision = currentUser?.department || '';

  const filteredNotifs = pushNotifications.filter((n) => {
    if (filterType === 'MY_DIVISION') {
      return n.targetDivision === 'ALL' || n.targetDivision === userDivision;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Kotak Masuk Notifikasi
              </h3>
              <p className="text-[11px] text-slate-400">
                Pemberitahuan resmi manajemen SPPG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Actions Bar */}
        <div className="pt-3 pb-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({pushNotifications.length})
            </button>
            <button
              onClick={() => setFilterType('MY_DIVISION')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterType === 'MY_DIVISION'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Divisi Saya
            </button>
          </div>

          {canBroadcast && onOpenCreatePush && (
            <button
              onClick={() => {
                onClose();
                onOpenCreatePush();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#024b3a] text-white text-xs font-bold hover:bg-[#023f31] flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Push</span>
            </button>
          )}
        </div>

        {/* List */}
        <div className="mt-2 space-y-2.5 overflow-y-auto flex-1 pr-1">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto stroke-[1.5] text-slate-300" />
              <p className="text-xs font-medium">Belum ada notifikasi yang diterima</p>
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const isRead = currentUser ? n.readBy.includes(currentUser.id) : false;
              const isUrgent = n.priority === 'URGENT';
              const isPenting = n.priority === 'PENTING';

              return (
                <div
                  key={n.id}
                  onClick={() => markPushNotificationAsRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    !isRead
                      ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                      : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          !isRead ? 'bg-amber-500 animate-ping' : 'bg-transparent'
                        }`}
                      />
                      <span className="font-extrabold text-xs text-slate-900">
                        {n.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : isPenting
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {n.targetDivision === 'ALL' ? 'Semua Divisi' : n.targetDivision}
                      </span>

                      {canBroadcast && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePushNotification(n.id);
                          }}
                          className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus Notifikasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                    {n.message}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      Oleh: <strong className="text-slate-700">{n.senderName}</strong> ({n.senderRole})
                    </span>
                    <span>{n.timeStr}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
