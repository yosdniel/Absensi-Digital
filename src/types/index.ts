export interface RoleDefinition {
  id: string;
  name: string;
  color: string;
  level: number; // 1 is highest (Developer)
  coordinatorRole: string; // The role that coordinates this role
  description?: string;
}

export interface User {
  id: string;
  email: string;
  pin: string; // 4-6 digit security PIN
  name: string;
  role: string; // Dynamic role matching hierarchy
  phone: string;
  phoneRegistered: boolean;
  faceRegistered: boolean;
  facePhotoUrl?: string;
  instansiCode: string;
  instansiName: string;
  joinedDate?: string;
  department: string; // Non-editable by regular user
  isBlocked?: boolean;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface ShiftPlot {
  userId: string;
  date: string; // YYYY-MM-DD
  shiftId: string; // 'OFF' | 'S1' | 'S2' | 'S3'
}

export type AttendanceType = 'MASUK' | 'PULANG';
export type AttendanceStatus = 'TEPAT_WAKTU' | 'TERLAMBAT';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  department?: string;
  type: AttendanceType;
  timestamp: string;
  timeStr: string;
  dateStr: string;
  status: AttendanceStatus;
  photoUrl: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  withinRadius: boolean;
  lateMinutes?: number;
  notes?: string;
}

export type LeaveType = 'Sakit' | 'Izin' | 'Cuti';
export type LeaveStatus = 'Disetujui' | 'Menunggu' | 'Ditolak';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  department?: string;
  type: LeaveType;
  dateStr: string; // 1 day only
  reason: string; // Mandatory
  proofUrl?: string; // Optional
  status: LeaveStatus;
  submittedAt: string;
  verifiedBy?: string;
}

export interface DivisionSchedule {
  id: string;
  divisionName: string; // e.g. "Divisi Pemorsian"
  coordinatorRole: string; // e.g. "Koordinator Pemorsian"
  memberRole: string; // e.g. "Divisi Pemorsian"
  jamMasuk: string; // e.g. "06:00"
  batasJamMasuk: string; // e.g. "07:00"
  toleransiMenit: number; // e.g. 15
  jamPulang: string; // e.g. "15:00"
  description: string;
}

export type SPLevel = 'SP 1' | 'SP 2' | 'SP 3';
export type SPStatus = 'Aktif' | 'Selesai' | 'Dicabut';

export interface WarningLetter {
  id: string;
  letterNumber: string; // e.g. "SP.01/SPPG/IV/2026"
  userId: string;
  userName: string;
  userRole: string;
  department: string;
  level: SPLevel;
  reasonCategory:
    | 'Keterlambatan Berulang'
    | 'Ketidakhadiran Tanpa Izin'
    | 'Pelanggaran SOP Sanitasi'
    | 'Kelalaian Tugas'
    | 'Pelanggaran Disiplin Kerja'
    | 'Lainnya';
  description: string;
  issuedDate: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  issuedBy: string; // Nama pembuat SP
  issuedByRole: string; // Developer / Kepala SPPG / Staff
  status: SPStatus;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'NORMAL' | 'PENTING';
  authorName: string;
  authorRole: string;
}

export interface InstansiSettings {
  name: string;
  code: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  address: string;
  jamMasukMulai: string; // "04:00"
  batasJamMasuk: string;  // "07:00"
  toleransiKeterlambatanMenit: number; // e.g. 15 minutes tolerance after batas jam masuk
  jamPulangMulai: string; // "13:00"
  intervalTerlambat: number; // interval minutes e.g. 30
  workingDays: string[]; // Active working days e.g. ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  requireFaceLiveness: boolean;
  autoDetectOvertime: boolean;
  appName?: string;
  appIcon?: string;
  phone?: string;
  email?: string;
  savedSubstitutes?: string[];
  workPeriodConfig?: WorkPeriodConfig;
}

// Helpers for Role Permissions
export function isDeveloperRole(role?: string): boolean {
  return role === 'Developer';
}

export function isKepalaSPPGRole(role?: string): boolean {
  return role === 'Kepala SPPG';
}

export function isStaffRole(role?: string): boolean {
  return role === 'Staff';
}

export function canDownloadRecap(role?: string): boolean {
  if (!role) return false;
  if (
    role.includes('Koordinator') ||
    role.includes('Divisi') ||
    role === 'Security' ||
    role === 'Cleaning'
  ) {
    return false;
  }
  return role === 'Developer' || role === 'Kepala SPPG' || role === 'Staff';
}

export function canMakeAnnouncement(role?: string): boolean {
  if (!role) return false;
  return role === 'Developer' || role === 'Kepala SPPG' || role === 'Staff';
}

export function canManageWorkingDays(role?: string): boolean {
  return role === 'Developer';
}

export function canManageMembers(role?: string): boolean {
  return role === 'Developer' || role === 'Kepala SPPG';
}

// Staff, Kepala SPPG, and Developer can manage location
export function canManageLocation(role?: string): boolean {
  if (!role) return false;
  return role === 'Developer' || role === 'Kepala SPPG' || role === 'Staff';
}

// Developer and Kepala SPPG can manage/change SPPG name
export function canManageSPPGName(role?: string): boolean {
  if (!role) return false;
  return role === 'Developer' || role === 'Kepala SPPG';
}

// Staff, Kepala SPPG, and Developer can manage division working hours
export function canManageWorkingHours(role?: string): boolean {
  if (!role) return false;
  return role === 'Developer' || role === 'Kepala SPPG' || role === 'Staff';
}

// Staff, Kepala SPPG, and Developer can issue Surat Peringatan (SP)
export function canIssueWarningLetter(role?: string): boolean {
  if (!role) return false;
  return role === 'Developer' || role === 'Kepala SPPG' || role === 'Staff';
}

export function canManageRoles(role?: string): boolean {
  return role === 'Developer';
}

export function canViewAllAttendance(role?: string): boolean {
  if (!role) return false;
  return role === 'Developer' || role === 'Kepala SPPG' || role === 'Staff';
}

export function canVerifyLeave(role?: string): boolean {
  if (!role) return false;
  return (
    role === 'Developer' ||
    role === 'Kepala SPPG' ||
    role === 'Staff' ||
    role.startsWith('Koordinator')
  );
}

// Helper to resolve working hours for any user based on their division or role
export function getUserSchedule(
  user: User | null | undefined,
  divisionSchedules: DivisionSchedule[],
  defaultSettings: InstansiSettings
): {
  divisionName: string;
  jamMasuk: string;
  batasJamMasuk: string;
  toleransiMenit: number;
  jamPulang: string;
} {
  if (!user) {
    return {
      divisionName: 'Umum SPPG',
      jamMasuk: defaultSettings.jamMasukMulai || '07:00',
      batasJamMasuk: defaultSettings.batasJamMasuk || '08:00',
      toleransiMenit: defaultSettings.toleransiKeterlambatanMenit || 15,
      jamPulang: defaultSettings.jamPulangMulai || '16:00',
    };
  }

  // Match by user role or user department
  const matched = divisionSchedules.find((s) => {
    return (
      s.coordinatorRole === user.role ||
      s.memberRole === user.role ||
      s.divisionName.toLowerCase() === user.department.toLowerCase() ||
      user.role.toLowerCase().includes(s.divisionName.toLowerCase().replace('divisi ', ''))
    );
  });

  if (matched) {
    return {
      divisionName: matched.divisionName,
      jamMasuk: matched.jamMasuk,
      batasJamMasuk: matched.batasJamMasuk,
      toleransiMenit: matched.toleransiMenit,
      jamPulang: matched.jamPulang,
    };
  }

  return {
    divisionName: user.department || 'Standar SPPG',
    jamMasuk: defaultSettings.jamMasukMulai || '07:00',
    batasJamMasuk: defaultSettings.batasJamMasuk || '08:00',
    toleransiMenit: defaultSettings.toleransiKeterlambatanMenit || 15,
    jamPulang: defaultSettings.jamPulangMulai || '16:00',
  };
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type TicketPriority = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'URGENT';
export type TicketCategory =
  | 'Umum'
  | 'Presensi & Geofence'
  | 'Pengajuan Izin / Sakit'
  | 'Jadwal & Shift'
  | 'Fasilitas & Dapur SPPG'
  | 'Kendala Akun & PIN'
  | 'Lainnya';

export interface SupportTicket {
  id: string; // e.g. "TKT-8241"
  userId: string;
  userName: string;
  userRole: string;
  department: string;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  claimedBy?: string;
  claimedByRole?: string;
  claimedAt?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedBy?: string;
  closedByRole?: string;
  closeNote?: string;
  lastMessage?: string;
}

export interface ChatMessage {
  id: string;
  ticketId?: string; // Attached ticket ID
  senderId: string;
  senderName: string;
  senderRole: string;
  division: string;
  text: string;
  timestamp: string;
  timeStr: string;
  isLeaveRequest?: boolean;
  leaveType?: 'Sakit' | 'Izin' | 'Cuti';
  leaveRequestId?: string;
  targetUserId?: string; // For DM thread targeting
  isSystemNote?: boolean;
  liked?: boolean;
}

export interface SubstituteAssignment {
  id: string;
  date: string;
  originalUserId: string;
  originalUserName: string;
  substituteName: string; // Manual name input for substitute
  substituteUserId?: string;
  substituteUserName?: string;
  division: string;
  assignedBy: string;
}

export interface WorkPeriodConfig {
  mode: 'MANUAL' | 'BIWEEKLY';
  periodName: string; // e.g. "Periode 1 Kerja (01 - 14 April 2026)"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  lastUpdatedBy?: string;
  lastUpdatedRole?: string;
  lastUpdatedAt?: string;
  notes?: string;
}

export type PushPriority = 'INFO' | 'PENTING' | 'URGENT';

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  priority: PushPriority;
  targetDivision: string; // 'ALL' or specific division name
  senderId: string;
  senderName: string;
  senderRole: string;
  timestamp: string;
  timeStr: string;
  readBy: string[];
}

export interface OfflineAttendanceQueueItem {
  id: string;
  record: AttendanceRecord;
  queuedAt: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  biometricHash: string;
}



