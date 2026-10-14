import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Shift,
  ShiftPlot,
  AttendanceRecord,
  LeaveRequest,
  InstansiSettings,
  LeaveStatus,
  AttendanceType,
  AttendanceStatus,
  RoleDefinition,
  Announcement,
  DivisionSchedule,
  WarningLetter,
  SPStatus,
  ChatMessage,
  SubstituteAssignment,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  WorkPeriodConfig,
  PushNotification,
  PushPriority,
  OfflineAttendanceQueueItem,
  isDeveloperRole,
  isKepalaSPPGRole,
  isStaffRole,
  canDownloadRecap,
  canMakeAnnouncement,
  canManageLocation,
  canManageWorkingHours,
  canIssueWarningLetter,
  getUserSchedule,
} from '../types';
import {
  INITIAL_INSTANSI,
  INITIAL_USERS,
  INITIAL_ROLES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SHIFTS,
  INITIAL_PLOTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_DIVISION_SCHEDULES,
  INITIAL_WARNING_LETTERS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_PUSH_NOTIFICATIONS,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  roles: RoleDefinition[];
  shifts: Shift[];
  plots: ShiftPlot[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
  divisionSchedules: DivisionSchedule[];
  warningLetters: WarningLetter[];
  settings: InstansiSettings;
  login: (identifier: string, pin: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  registerFace: (userId: string, photoDataUrl: string) => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  recordAttendance: (
    type: AttendanceType,
    photoUrl: string,
    coords?: { lat: number; lng: number }
  ) => { success: boolean; message: string; record?: AttendanceRecord };
  submitLeaveRequest: (data: {
    type: 'Sakit' | 'Izin' | 'Cuti';
    reason: string;
    proofUrl?: string;
  }) => { success: boolean; message?: string };
  updateLeaveStatus: (id: string, status: LeaveStatus, verifiedBy?: string) => void;
  addShift: (shift: Omit<Shift, 'id'> & { id?: string }) => void;
  updateShift: (shift: Shift) => void;
  setPlot: (userId: string, date: string, shiftId: string) => void;
  bulkPlot: (date: string, shiftId: string, userIds?: string[]) => void;
  updateSettings: (newSettings: Partial<InstansiSettings>) => void;
  setWorkingDays: (days: string[]) => void;
  updateDivisionSchedule: (schedule: DivisionSchedule) => void;
  addWarningLetter: (data: Omit<WarningLetter, 'id' | 'letterNumber'>) => { success: boolean; letter?: WarningLetter };
  updateWarningLetterStatus: (id: string, status: SPStatus) => void;
  deleteWarningLetter: (id: string) => void;
  addUser: (user: Omit<User, 'instansiCode' | 'instansiName'>) => { success: boolean; message?: string };
  updateUser: (userId: string, user: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addRole: (role: Omit<RoleDefinition, 'id'>) => void;
  updateRole: (role: RoleDefinition) => void;
  deleteRole: (id: string) => void;
  addAnnouncement: (announcement: { title: string; content: string; priority: 'NORMAL' | 'PENTING' }) => { success: boolean; message?: string };
  deleteAnnouncement: (id: string) => void;
  resetAllData: () => void;
  isTodayWorkingDay: () => boolean;
  playSoftNotificationChime: () => void;
  triggerLocalPushNotification: (title: string, body: string) => void;
  chatMessages: ChatMessage[];
  substituteAssignments: SubstituteAssignment[];
  supportTickets: SupportTicket[];
  sendChatMessage: (text: string, isLeaveRequest?: boolean, leaveType?: 'Sakit' | 'Izin' | 'Cuti', targetUserId?: string) => void;
  createSupportTicket: (data: {
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    initialMessage: string;
  }) => { success: boolean; ticket?: SupportTicket };
  updateTicketStatus: (ticketId: string, status: TicketStatus, closeNote?: string) => void;
  closeSupportTicket: (ticketId: string, closeNote?: string) => void;
  claimSupportTicket: (ticketId: string) => void;
  sendTicketMessage: (
    ticketId: string,
    text: string,
    isLeaveRequest?: boolean,
    leaveType?: 'Sakit' | 'Izin' | 'Cuti'
  ) => void;
  sendBotTicketMessage: (ticketId: string, text: string) => void;
  toggleMessageLike: (messageId: string) => void;
  assignSubstitute: (originalUserId: string, substituteName: string, date: string) => void;
  removeSubstitute: (assignmentId: string) => void;
  pushNotifications: PushNotification[];
  sendPushNotification: (data: {
    title: string;
    message: string;
    priority: PushPriority;
    targetDivision: string;
  }) => { success: boolean; message?: string };
  markPushNotificationAsRead: (id: string) => void;
  deletePushNotification: (id: string) => void;
  activePushBanner: PushNotification | null;
  dismissPushBanner: () => void;
  backgroundSyncEnabled: boolean;
  setBackgroundSyncEnabled: (enabled: boolean) => void;
  pendingOfflineAttendance: OfflineAttendanceQueueItem[];
  queueOfflineAttendance: (type: AttendanceType, photoUrl: string, location?: { lat: number; lng: number }) => { success: boolean; message: string };
  syncOfflineAttendance: () => Promise<{ success: boolean; syncedCount: number; message: string }>;
  updateWorkPeriodConfig: (config: WorkPeriodConfig) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatIndonesianDate(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sppg_users_v4');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem('sppg_roles_v4');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sppg_currentUser_v4');
    if (saved) return JSON.parse(saved);
    return INITIAL_USERS[0];
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('sppg_shifts_v4');
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [plots, setPlots] = useState<ShiftPlot[]>(() => {
    const saved = localStorage.getItem('sppg_plots_v4');
    return saved ? JSON.parse(saved) : INITIAL_PLOTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('sppg_attendance_v4');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('sppg_leave_v4');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('sppg_announcements_v4');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [divisionSchedules, setDivisionSchedules] = useState<DivisionSchedule[]>(() => {
    const saved = localStorage.getItem('sppg_division_schedules_v4');
    return saved ? JSON.parse(saved) : INITIAL_DIVISION_SCHEDULES;
  });

  const [warningLetters, setWarningLetters] = useState<WarningLetter[]>(() => {
    const saved = localStorage.getItem('sppg_warning_letters_v4');
    return saved ? JSON.parse(saved) : INITIAL_WARNING_LETTERS;
  });

  const [settings, setSettings] = useState<InstansiSettings>(() => {
    const saved = localStorage.getItem('sppg_settings_v4');
    return saved ? JSON.parse(saved) : INITIAL_INSTANSI;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('sppg_support_tickets_v4');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sppg_chat_messages_v4');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [substituteAssignments, setSubstituteAssignments] = useState<SubstituteAssignment[]>(() => {
    const saved = localStorage.getItem('sppg_substitute_assignments_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem('sppg_push_notifications_v4');
    return saved ? JSON.parse(saved) : INITIAL_PUSH_NOTIFICATIONS;
  });

  const [activePushBanner, setActivePushBanner] = useState<PushNotification | null>(null);

  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sppg_background_sync_v4');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [pendingOfflineAttendance, setPendingOfflineAttendance] = useState<OfflineAttendanceQueueItem[]>(() => {
    const saved = localStorage.getItem('sppg_offline_attendance_queue_v4');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sppg_push_notifications_v4', JSON.stringify(pushNotifications));
  }, [pushNotifications]);

  useEffect(() => {
    localStorage.setItem('sppg_background_sync_v4', JSON.stringify(backgroundSyncEnabled));
  }, [backgroundSyncEnabled]);

  useEffect(() => {
    localStorage.setItem('sppg_offline_attendance_queue_v4', JSON.stringify(pendingOfflineAttendance));
  }, [pendingOfflineAttendance]);

  useEffect(() => {
    localStorage.setItem('sppg_support_tickets_v4', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('sppg_users_v4', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sppg_roles_v4', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('sppg_currentUser_v4', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sppg_shifts_v4', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('sppg_plots_v4', JSON.stringify(plots));
  }, [plots]);

  useEffect(() => {
    localStorage.setItem('sppg_attendance_v4', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('sppg_leave_v4', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('sppg_announcements_v4', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('sppg_division_schedules_v4', JSON.stringify(divisionSchedules));
  }, [divisionSchedules]);

  useEffect(() => {
    localStorage.setItem('sppg_warning_letters_v4', JSON.stringify(warningLetters));
  }, [warningLetters]);

  useEffect(() => {
    localStorage.setItem('sppg_settings_v4', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sppg_chat_messages_v4', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('sppg_substitute_assignments_v4', JSON.stringify(substituteAssignments));
  }, [substituteAssignments]);

  // Push notification timer for approaching working hours (15 mins before) and late threshold (5 mins after)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      const now = new Date();
      const todayDateStr = formatIndonesianDate(now);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const schedule = getUserSchedule(currentUser, divisionSchedules, settings);
      const [startH, startM] = schedule.jamMasuk.split(':').map(Number);
      const [limitH, limitM] = schedule.batasJamMasuk.split(':').map(Number);

      const startMinutes = startH * 60 + startM;
      const limitMinutes = limitH * 60 + limitM;

      const hasCheckedInToday = attendance.some(
        (a) => a.userId === currentUser.id && a.dateStr === todayDateStr && a.type === 'MASUK'
      );

      if (!hasCheckedInToday) {
        if (currentMinutes === startMinutes - 15) {
          triggerLocalPushNotification(
            'Peringatan Jam Kerja',
            `Jam kerja ${schedule.divisionName} akan dimulai dalam 15 menit (${schedule.jamMasuk}). Bersiaplah untuk presensi!`
          );
        }
        if (currentMinutes === limitMinutes + 5) {
          triggerLocalPushNotification(
            'Peringatan Keterlambatan Absensi',
            `Anda telah melewati batas jam masuk absensi (${schedule.batasJamMasuk})! Segera lakukan presensi.`
          );
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentUser, settings, divisionSchedules, attendance]);

  // Background Sync listener: when network comes back online, automatically sync queued attendance
  useEffect(() => {
    const handleOnline = () => {
      if (backgroundSyncEnabled && pendingOfflineAttendance.length > 0) {
        syncOfflineAttendance();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [backgroundSyncEnabled, pendingOfflineAttendance]);

  // Idle timeout feature (5 minutes = 300,000 ms)
  useEffect(() => {
    if (!currentUser) return;

    let lastActivityTime = Date.now();
    const handleActivity = () => {
      lastActivityTime = Date.now();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    const interval = setInterval(() => {
      if (currentUser && Date.now() - lastActivityTime > 300000) {
        triggerLocalPushNotification(
          'Sesi Berakhir (Idle Timeout)',
          'Anda otomatis keluar karena tidak ada aktivitas selama 5 menit demi keamanan perangkat bersama.'
        );
        logout();
      }
    }, 15000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(interval);
    };
  }, [currentUser]);


  // Check if today is an active working day based on division rules
  const isTodayWorkingDay = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = days[new Date().getDay()];

    if (currentUser) {
      const dept = (currentUser.department || '').toLowerCase();
      const role = (currentUser.role || '').toLowerCase();

      // Divisi Persiapan dan Pengolahan dimulai masuk hari Minggu
      if (
        dept.includes('persiapan') ||
        dept.includes('pengolahan') ||
        role.includes('persiapan') ||
        role.includes('pengolahan')
      ) {
        return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(todayName);
      }

      // Security masuk sampai hari Sabtu, Minggu libur
      if (dept.includes('keamanan') || role.includes('security')) {
        return ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].includes(todayName);
      }

      // Divisi lainnya dimulai masuk hari Senin
      return ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(todayName);
    }

    return (settings.workingDays || []).includes(todayName);
  };

  const login = (identifier: string, pin: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

    const found = users.find(
      (u) =>
        u.id.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.name.toLowerCase() === cleanId
    );

    if (!found) {
      return { success: false, message: 'ID Pengguna atau Email tidak ditemukan.' };
    }

    if (found.pin !== cleanPin) {
      return { success: false, message: 'PIN yang Anda masukkan salah. Coba lagi.' };
    }

    setCurrentUser(found);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) setCurrentUser(found);
  };

  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    // If not developer, do not allow changing department or role!
    const filteredUpdates = { ...updates };
    if (!isDeveloperRole(currentUser?.role)) {
      delete filteredUpdates.department;
      delete filteredUpdates.role;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...filteredUpdates } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...filteredUpdates } : null));
    }
  };

  const registerFace = (userId: string, photoDataUrl: string) => {
    updateUserProfile(userId, { faceRegistered: true, facePhotoUrl: photoDataUrl });
  };

  const recordAttendance = (
    type: AttendanceType,
    photoUrl: string,
    coords?: { lat: number; lng: number }
  ) => {
    if (!currentUser) return { success: false, message: 'Harap masuk terlebih dahulu' };

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const dateStr = formatIndonesianDate(now);

    const userLat = coords?.lat ?? settings.lat;
    const userLng = coords?.lng ?? settings.lng;

    const distance = calculateDistanceMeters(
      userLat,
      userLng,
      settings.lat,
      settings.lng
    );
    const withinRadius = distance <= settings.radius;

    if (!withinRadius) {
      return {
        success: false,
        message: `Presensi Ditolak: Anda berada ${distance}m dari lokasi kantor (Batas radius: ${settings.radius}m). Silakan dekati area kantor untuk melakukan presensi.`,
      };
    }

    let status: AttendanceStatus = 'TEPAT_WAKTU';
    let lateMinutes = 0;

    if (type === 'MASUK') {
      const [limitH, limitM] = settings.batasJamMasuk.split(':').map(Number);
      const limitMinutes = limitH * 60 + limitM;
      const tolerance = settings.toleransiKeterlambatanMenit || 0;
      const totalAllowedMinutes = limitMinutes + tolerance;

      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      if (currentMinutes > totalAllowedMinutes) {
        status = 'TERLAMBAT';
        lateMinutes = currentMinutes - limitMinutes;
      }
    }

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      department: currentUser.department,
      type,
      timestamp: now.toISOString(),
      timeStr,
      dateStr,
      status,
      photoUrl,
      lat: userLat,
      lng: userLng,
      distanceMeters: distance,
      withinRadius,
      lateMinutes,
    };

    setAttendance((prev) => [newRecord, ...prev]);

    return {
      success: true,
      message: `Presensi Absen ${type === 'MASUK' ? 'Masuk' : 'Pulang'} Berhasil!`,
      record: newRecord,
    };
  };

  // Leave Request: exactly 1 day (today only, no multi-day range)
  const submitLeaveRequest = (data: {
    type: 'Sakit' | 'Izin' | 'Cuti';
    reason: string;
    proofUrl?: string;
  }) => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu' };
    if (!data.reason.trim()) {
      return { success: false, message: 'Keterangan/alasan wajib diisi.' };
    }

    const now = new Date();
    const dateStr = formatIndonesianDate(now);

    // Enforce 1 leave request per day per user
    const existingToday = leaveRequests.find(
      (lr) => lr.userId === currentUser.id && lr.dateStr === dateStr
    );
    if (existingToday) {
      return {
        success: false,
        message: 'Anda sudah mengajukan izin/cuti/sakit untuk hari ini. Pengajuan hanya dapat dilakukan sekali sehari.',
      };
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const submittedAt = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
      now.getHours()
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRequest: LeaveRequest = {
      id: `LV-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      department: currentUser.department,
      type: data.type,
      dateStr, // 1 day only
      reason: data.reason.trim(),
      proofUrl: data.proofUrl || '',
      status: 'Menunggu',
      submittedAt,
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);
    return { success: true, message: 'Pengajuan izin berhasil dikirim.' };
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus, verifiedBy?: string) => {
    setLeaveRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, verifiedBy: verifiedBy || currentUser?.name } : item
      )
    );
  };

  const sendChatMessage = (
    text: string,
    isLeaveRequest?: boolean,
    leaveType?: 'Sakit' | 'Izin' | 'Cuti',
    targetUserId?: string
  ) => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let computedIsLeave = isLeaveRequest;
    let computedLeaveType = leaveType;
    const lower = text.toLowerCase();
    if (!computedIsLeave && (lower.includes('izin') || lower.includes('sakit') || lower.includes('cuti'))) {
      computedIsLeave = true;
      if (lower.includes('sakit')) computedLeaveType = 'Sakit';
      else if (lower.includes('cuti')) computedLeaveType = 'Cuti';
      else computedLeaveType = 'Izin';
    }

    if (computedIsLeave) {
      const res = submitLeaveRequest({
        type: computedLeaveType || 'Izin',
        reason: text,
      });
      if (!res.success) {
        triggerLocalPushNotification('Gagal Mengajukan Izin', res.message || 'Pengajuan izin hanya bisa sekali sehari.');
        return;
      }
    }

    const isStaffOrHead = ['Developer', 'Kepala SPPG', 'Staff'].includes(currentUser.role);
    const resolvedTargetUserId = targetUserId || (isStaffOrHead ? undefined : currentUser.id);

    const newMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      division: currentUser.department || 'Umum',
      text,
      timestamp: now.toISOString(),
      timeStr,
      isLeaveRequest: computedIsLeave,
      leaveType: computedLeaveType,
      targetUserId: resolvedTargetUserId,
    };

    setChatMessages((prev) => [...prev, newMsg]);
  };

  const createSupportTicket = (data: {
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    initialMessage: string;
  }) => {
    if (!currentUser) return { success: false };
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
      now.getHours()
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: SupportTicket = {
      id: ticketId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      department: currentUser.department || 'Umum',
      title: data.title.trim() || `Tiket Bantuan ${data.category}`,
      category: data.category,
      priority: data.priority,
      status: 'OPEN',
      createdAt: dateFormatted,
      updatedAt: dateFormatted,
      lastMessage: data.initialMessage.trim(),
    };

    setSupportTickets((prev) => [newTicket, ...prev]);

    const newMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      ticketId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      division: currentUser.department || 'Umum',
      text: data.initialMessage.trim(),
      timestamp: now.toISOString(),
      timeStr,
      targetUserId: ['Developer', 'Kepala SPPG', 'Staff'].includes(currentUser.role) ? undefined : currentUser.id,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    playSoftNotificationChime();
    return { success: true, ticket: newTicket };
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, closeNote?: string) => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
      now.getHours()
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const isClosing = status === 'CLOSED';
        return {
          ...t,
          status,
          updatedAt: dateFormatted,
          closedAt: isClosing ? dateFormatted : t.closedAt,
          closedBy: isClosing ? (currentUser?.name || 'Staff') : undefined,
          closedByRole: isClosing ? (currentUser?.role || 'Staff') : undefined,
          closeNote: isClosing ? (closeNote || 'Tiket telah diselesaikan.') : undefined,
        };
      })
    );

    if (status === 'CLOSED') {
      const systemMsg: ChatMessage = {
        id: `MSG-SYS-${Date.now()}`,
        ticketId,
        senderId: currentUser?.id || 'SYSTEM',
        senderName: 'Sistem SPPG',
        senderRole: currentUser?.role || 'Staff',
        division: 'Pusat Dukungan',
        text: `🔒 Tiket telah diselesaikan dan ditutup oleh ${currentUser?.name || 'Staff'} (${currentUser?.role || 'Staff'}).\nCatatan: ${closeNote || 'Kendala/pertanyaan telah diselesaikan.'}`,
        timestamp: now.toISOString(),
        timeStr,
        isSystemNote: true,
      };
      setChatMessages((prev) => [...prev, systemMsg]);
    }
  };

  const closeSupportTicket = (ticketId: string, closeNote?: string) => {
    updateTicketStatus(ticketId, 'CLOSED', closeNote);
  };

  const claimSupportTicket = (ticketId: string) => {
    if (!currentUser) return;
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
      now.getHours()
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'IN_PROGRESS',
          claimedBy: currentUser.name,
          claimedByRole: currentUser.role,
          claimedAt: dateFormatted,
          updatedAt: dateFormatted,
        };
      })
    );

    const claimMsg: ChatMessage = {
      id: `MSG-CLAIM-${Date.now()}`,
      ticketId,
      senderId: currentUser.id,
      senderName: 'Sistem SPPG',
      senderRole: currentUser.role,
      division: 'Pusat Dukungan',
      text: `💼 Tiket telah diklaim dan ditangani oleh ${currentUser.name} (${currentUser.role}).`,
      timestamp: now.toISOString(),
      timeStr,
      isSystemNote: true,
    };
    setChatMessages((prev) => [...prev, claimMsg]);
    playSoftNotificationChime();
  };

  const sendTicketMessage = (
    ticketId: string,
    text: string,
    isLeaveRequest?: boolean,
    leaveType?: 'Sakit' | 'Izin' | 'Cuti'
  ) => {
    if (!currentUser || !text.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let computedIsLeave = isLeaveRequest;
    let computedLeaveType = leaveType;
    const lower = text.toLowerCase();
    if (!computedIsLeave && (lower.includes('izin') || lower.includes('sakit') || lower.includes('cuti'))) {
      computedIsLeave = true;
      if (lower.includes('sakit')) computedLeaveType = 'Sakit';
      else if (lower.includes('cuti')) computedLeaveType = 'Cuti';
      else computedLeaveType = 'Izin';
    }

    if (computedIsLeave) {
      submitLeaveRequest({
        type: computedLeaveType || 'Izin',
        reason: text,
      });
    }

    const newMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      ticketId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      division: currentUser.department || 'Umum',
      text: text.trim(),
      timestamp: now.toISOString(),
      timeStr,
      isLeaveRequest: computedIsLeave,
      leaveType: computedLeaveType,
      liked: false,
    };

    setChatMessages((prev) => [...prev, newMsg]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${timeStr}`;
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, updatedAt: dateFormatted, lastMessage: text.trim() } : t))
    );
  };

  const toggleMessageLike = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, liked: !m.liked } : m))
    );
  };

  const assignSubstitute = (originalUserId: string, substituteName: string, date: string) => {
    const origUser = users.find((u) => u.id === originalUserId);
    if (!origUser || !substituteName.trim()) return;

    const trimmedSub = substituteName.trim();
    const currentSaved = settings.savedSubstitutes || [];
    const newSaved = currentSaved.includes(trimmedSub) ? currentSaved : [...currentSaved, trimmedSub];
    updateSettings({ savedSubstitutes: newSaved });

    const newAssign: SubstituteAssignment = {
      id: `SUB-${Date.now()}`,
      date,
      originalUserId,
      originalUserName: origUser.name,
      substituteName: trimmedSub,
      division: origUser.department,
      assignedBy: currentUser?.name || 'Staff',
    };

    setSubstituteAssignments((prev) => [
      ...prev.filter((p) => !(p.originalUserId === originalUserId && p.date === date)),
      newAssign,
    ]);
  };

  const removeSubstitute = (assignmentId: string) => {
    setSubstituteAssignments((prev) => prev.filter((p) => p.id !== assignmentId));
  };

  const sendPushNotification = (data: {
    title: string;
    message: string;
    priority: PushPriority;
    targetDivision: string;
  }) => {
    if (!currentUser) return { success: false, message: 'Harus login untuk mengirim notifikasi' };
    const isDev = isDeveloperRole(currentUser.role);
    const isKepala = isKepalaSPPGRole(currentUser.role);
    const isStaff = isStaffRole(currentUser.role);

    if (!isDev && !isKepala && !isStaff) {
      return {
        success: false,
        message: 'Hanya Developer, Kepala SPPG, dan Staff yang berwenang mengirim broadcast push notifikasi.',
      };
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNotif: PushNotification = {
      id: `PUSH-${Date.now()}`,
      title: data.title.trim(),
      message: data.message.trim(),
      priority: data.priority,
      targetDivision: data.targetDivision,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      timestamp: now.toISOString(),
      timeStr,
      readBy: [currentUser.id],
    };

    setPushNotifications((prev) => [newNotif, ...prev]);
    setActivePushBanner(newNotif);
    playSoftNotificationChime();
    triggerLocalPushNotification(data.title, data.message);

    return { success: true };
  };

  const markPushNotificationAsRead = (id: string) => {
    if (!currentUser) return;
    setPushNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.readBy.includes(currentUser.id)) {
          return { ...n, readBy: [...n.readBy, currentUser.id] };
        }
        return n;
      })
    );
  };

  const deletePushNotification = (id: string) => {
    setPushNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const dismissPushBanner = () => {
    setActivePushBanner(null);
  };

  const queueOfflineAttendance = (
    type: AttendanceType,
    photoUrl: string,
    location?: { lat: number; lng: number }
  ) => {
    if (!currentUser) return { success: false, message: 'User tidak ditemukan' };
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = formatIndonesianDate(now);

    const userLat = location?.lat ?? settings.lat;
    const userLng = location?.lng ?? settings.lng;
    const distance = calculateDistanceMeters(userLat, userLng, settings.lat, settings.lng);

    const mockHash =
      'SIG-' +
      Math.random().toString(36).substring(2, 8).toUpperCase() +
      '-' +
      Date.now().toString(36).toUpperCase();

    const record: AttendanceRecord = {
      id: `ATT-OFFLINE-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      department: currentUser.department,
      type,
      timestamp: now.toISOString(),
      timeStr,
      dateStr,
      status: 'TEPAT_WAKTU',
      photoUrl,
      lat: userLat,
      lng: userLng,
      distanceMeters: distance,
      withinRadius: distance <= settings.radius,
      lateMinutes: 0,
    };

    const queueItem: OfflineAttendanceQueueItem = {
      id: `QUEUE-${Date.now()}`,
      record,
      queuedAt: now.toISOString(),
      status: 'PENDING',
      biometricHash: mockHash,
    };

    setPendingOfflineAttendance((prev) => [...prev, queueItem]);
    return {
      success: true,
      message: 'Presensi tersimpan di memori offline perangkat. Akan disinkronkan otomatis saat ada koneksi.',
    };
  };

  const syncOfflineAttendance = async () => {
    if (pendingOfflineAttendance.length === 0) {
      return { success: true, syncedCount: 0, message: 'Tidak ada antrean presensi offline.' };
    }

    const count = pendingOfflineAttendance.length;
    const newRecords: AttendanceRecord[] = pendingOfflineAttendance.map((item) => ({
      ...item.record,
      id: `ATT-SYNCED-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    }));

    setAttendance((prev) => [...newRecords, ...prev]);
    setPendingOfflineAttendance([]);
    playSoftNotificationChime();
    triggerLocalPushNotification(
      'Background Sync Selesai',
      `${count} data presensi offline telah berhasil disinkronkan ke server SPPG.`
    );

    return {
      success: true,
      syncedCount: count,
      message: `Berhasil menyinkronkan ${count} data presensi offline.`,
    };
  };

  const updateWorkPeriodConfig = (config: WorkPeriodConfig) => {
    const updated: WorkPeriodConfig = {
      ...config,
      lastUpdatedBy: currentUser?.name || 'Manajemen',
      lastUpdatedRole: currentUser?.role || 'Staff',
      lastUpdatedAt: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    updateSettings({ workPeriodConfig: updated });
  };



  const addShift = (shiftData: Omit<Shift, 'id'> & { id?: string }) => {
    const nextId = shiftData.id || `S${shifts.length + 1}`;
    const newShift: Shift = {
      id: nextId,
      name: shiftData.name,
      startTime: shiftData.startTime,
      endTime: shiftData.endTime,
    };
    setShifts((prev) => [...prev, newShift]);
  };

  const updateShift = (shift: Shift) => {
    setShifts((prev) => prev.map((s) => (s.id === shift.id ? shift : s)));
  };

  const setPlot = (userId: string, date: string, shiftId: string) => {
    setPlots((prev) => {
      const filtered = prev.filter((p) => !(p.userId === userId && p.date === date));
      return [...filtered, { userId, date, shiftId }];
    });
  };

  const bulkPlot = (date: string, shiftId: string, userIds?: string[]) => {
    const targetIds = userIds && userIds.length > 0 ? userIds : users.map((u) => u.id);
    setPlots((prev) => {
      const filtered = prev.filter(
        (p) => !(p.date === date && targetIds.includes(p.userId))
      );
      const newItems = targetIds.map((uId) => ({
        userId: uId,
        date,
        shiftId,
      }));
      return [...filtered, ...newItems];
    });
  };

  const updateSettings = (newSettings: Partial<InstansiSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setWorkingDays = (days: string[]) => {
    updateSettings({ workingDays: days });
  };

  const addUser = (userData: Omit<User, 'instansiCode' | 'instansiName'>) => {
    const existing = users.find(
      (u) =>
        u.id.toLowerCase() === userData.id.toLowerCase() ||
        u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existing) {
      return { success: false, message: 'ID Pengguna atau Email sudah digunakan.' };
    }

    const newUser: User = {
      ...userData,
      instansiCode: settings.code,
      instansiName: settings.name,
      joinedDate: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    setUsers((prev) => [...prev, newUser]);
    return { success: true };
  };

  const updateUser = (userId: string, user: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...user } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...user } : null));
    }
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const addRole = (roleData: Omit<RoleDefinition, 'id'>) => {
    const id = `ROLE-${Date.now()}`;
    setRoles((prev) => [...prev, { ...roleData, id }]);
  };

  const updateRole = (roleData: RoleDefinition) => {
    setRoles((prev) => prev.map((r) => (r.id === roleData.id ? roleData : r)));
  };

  const deleteRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const addAnnouncement = (data: { title: string; content: string; priority: 'NORMAL' | 'PENTING' }) => {
    if (!currentUser || !canMakeAnnouncement(currentUser.role)) {
      return { success: false, message: 'Hanya Developer, Kepala SPPG, dan Staff yang dapat membuat pengumuman.' };
    }

    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    const newAnn: Announcement = {
      id: `ANN-${Date.now()}`,
      title: data.title,
      content: data.content,
      priority: data.priority,
      date: dateStr,
      authorName: currentUser.name,
      authorRole: currentUser.role,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    return { success: true };
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const updateDivisionSchedule = (schedule: DivisionSchedule) => {
    setDivisionSchedules((prev) =>
      prev.map((s) => (s.id === schedule.id ? schedule : s))
    );
  };

  const addWarningLetter = (data: Omit<WarningLetter, 'id' | 'letterNumber' | 'level'> & { level?: 'SP 1' | 'SP 2' | 'SP 3' }) => {
    if (!currentUser || !canIssueWarningLetter(currentUser.role)) {
      return { success: false };
    }

    // Check existing active warning letters for target user
    const activeForUser = warningLetters.filter(
      (l) => l.userId === data.userId && l.status === 'Aktif'
    );

    let assignedLevel: 'SP 1' | 'SP 2' | 'SP 3' = data.level || 'SP 1';
    if (activeForUser.length > 0) {
      const hasSp2 = activeForUser.some((l) => l.level === 'SP 2');
      const hasSp1 = activeForUser.some((l) => l.level === 'SP 1');
      const hasSp3 = activeForUser.some((l) => l.level === 'SP 3');

      if (hasSp3 || hasSp2) {
        assignedLevel = 'SP 3';
      } else if (hasSp1) {
        assignedLevel = 'SP 2';
      }
    }

    const seq = String(warningLetters.length + 1).padStart(2, '0');
    const now = new Date();
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const letterNumber = `SP.${seq}/${settings.code || 'SPPG'}/${romanMonths[now.getMonth()]}/${now.getFullYear()}`;

    const newLetter: WarningLetter = {
      ...data,
      level: assignedLevel,
      id: `SP-${Date.now()}`,
      letterNumber,
      issuedBy: currentUser.name,
      issuedByRole: currentUser.role,
    };

    setWarningLetters((prev) => [newLetter, ...prev]);

    // If SP 3 reached, block user account
    if (assignedLevel === 'SP 3') {
      setUsers((prev) =>
        prev.map((u) => (u.id === data.userId ? { ...u, isBlocked: true } : u))
      );
    }

    return { success: true, letter: newLetter };
  };

  const updateWarningLetterStatus = (id: string, status: SPStatus) => {
    setWarningLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  const deleteWarningLetter = (id: string) => {
    setWarningLetters((prev) => prev.filter((l) => l.id !== id));
  };

  const playSoftNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // First melodic bell note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Second soft bell tone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.0, now + 0.15); // A5
      gain2.gain.setValueAtTime(0.001, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.65);
    } catch {
      // Audio might be restricted by browser policy if un-interacted
    }
  };

  const triggerLocalPushNotification = (title: string, body: string) => {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      }
    } catch (err) {
      console.debug('Notification trigger error:', err);
    }
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setRoles(INITIAL_ROLES);
    setShifts(INITIAL_SHIFTS);
    setPlots(INITIAL_PLOTS);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setDivisionSchedules(INITIAL_DIVISION_SCHEDULES);
    setWarningLetters(INITIAL_WARNING_LETTERS);
    setSupportTickets(INITIAL_SUPPORT_TICKETS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setPushNotifications(INITIAL_PUSH_NOTIFICATIONS);
    setPendingOfflineAttendance([]);
    setBackgroundSyncEnabled(true);
    setSettings(INITIAL_INSTANSI);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        roles,
        shifts,
        plots,
        attendance,
        leaveRequests,
        announcements,
        divisionSchedules,
        warningLetters,
        settings,
        login,
        logout,
        switchUser,
        registerFace,
        updateUserProfile,
        recordAttendance,
        submitLeaveRequest,
        updateLeaveStatus,
        addShift,
        updateShift,
        setPlot,
        bulkPlot,
        updateSettings,
        setWorkingDays,
        updateDivisionSchedule,
        addWarningLetter,
        updateWarningLetterStatus,
        deleteWarningLetter,
        addUser,
        updateUser,
        deleteUser,
        addRole,
        updateRole,
        deleteRole,
        addAnnouncement,
        deleteAnnouncement,
        resetAllData,
        isTodayWorkingDay,
        playSoftNotificationChime,
        triggerLocalPushNotification,
        chatMessages,
        substituteAssignments,
        supportTickets,
        sendChatMessage,
        createSupportTicket,
        updateTicketStatus,
        closeSupportTicket,
        claimSupportTicket,
        sendTicketMessage,
        toggleMessageLike,
        assignSubstitute,
        removeSubstitute,
        pushNotifications,
        sendPushNotification,
        markPushNotificationAsRead,
        deletePushNotification,
        activePushBanner,
        dismissPushBanner,
        backgroundSyncEnabled,
        setBackgroundSyncEnabled,
        pendingOfflineAttendance,
        queueOfflineAttendance,
        syncOfflineAttendance,
        updateWorkPeriodConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
