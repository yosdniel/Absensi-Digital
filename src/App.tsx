import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { FullScreenLayout } from './components/layout/FullScreenLayout';
import { LoginScreen } from './components/screens/LoginScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ProfileMenuScreen } from './components/screens/ProfileMenuScreen';
import { EditProfileScreen } from './components/screens/EditProfileScreen';
import { RoleManagementScreen } from './components/screens/RoleManagementScreen';
import { WorkingDaysScreen } from './components/screens/WorkingDaysScreen';
import { ShiftManagementScreen } from './components/screens/ShiftManagementScreen';
import { WorkingHoursScreen } from './components/screens/WorkingHoursScreen';
import { LocationSettingsScreen } from './components/screens/LocationSettingsScreen';
import { MemberListScreen } from './components/screens/MemberListScreen';
import { LeaveFormScreen } from './components/screens/LeaveFormScreen';
import { LeaveHistoryScreen } from './components/screens/LeaveHistoryScreen';
import { FaceRegistrationScreen } from './components/screens/FaceRegistrationScreen';
import { AttendanceHistoryScreen } from './components/screens/AttendanceHistoryScreen';
import { LiveChatScreen } from './components/screens/LiveChatScreen';
import { AttendanceScanModal } from './components/modals/AttendanceScanModal';
import { RecapModal } from './components/modals/RecapModal';
import { PhotoProofModal } from './components/common/PhotoProofModal';
import { AttendanceType, AttendanceRecord, LeaveRequest } from './types';

type ScreenType =
  | 'dashboard'
  | 'profile_menu'
  | 'attendance_history'
  | 'edit_profile'
  | 'role_management'
  | 'working_days'
  | 'shift_management'
  | 'working_hours'
  | 'location_settings'
  | 'member_list'
  | 'leave_form'
  | 'leave_history'
  | 'face_registration'
  | 'live_chat';

function AppContent() {
  const { currentUser } = useApp();

  const [activeScreen, setActiveScreen] = useState<ScreenType>('dashboard');

  // Modals state
  const [attendanceModal, setAttendanceModal] = useState<{
    isOpen: boolean;
    type: AttendanceType;
  }>({
    isOpen: false,
    type: 'MASUK',
  });

  const [recapModalOpen, setRecapModalOpen] = useState(false);

  const [photoProof, setPhotoProof] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: 'Bukti Foto Absen',
    subtitle: '',
  });

  // Handle back navigation
  const handleBack = () => {
    if (activeScreen === 'dashboard') {
      // already root
    } else if (activeScreen === 'attendance_history') {
      setActiveScreen('dashboard');
    } else if (activeScreen === 'profile_menu') {
      setActiveScreen('dashboard');
    } else {
      setActiveScreen('profile_menu');
    }
  };

  // If user is not logged in, render clean full-screen Login
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <FullScreenLayout
      activeScreen={activeScreen}
      onNavigate={(screen) => setActiveScreen(screen)}
    >
      {/* Dynamic Screen Routing */}
      {activeScreen === 'dashboard' && (
        <DashboardScreen
          onOpenProfile={() => setActiveScreen('profile_menu')}
          onOpenFaceRegistration={() => setActiveScreen('face_registration')}
          onStartAttendance={(type) => setAttendanceModal({ isOpen: true, type })}
          onNavigate={(screen) => setActiveScreen(screen as ScreenType)}
        />
      )}

      {activeScreen === 'attendance_history' && (
        <AttendanceHistoryScreen
          onBack={() => setActiveScreen('dashboard')}
          onOpenPhotoProof={(record: AttendanceRecord) => {
            setPhotoProof({
              isOpen: true,
              imageUrl: record.photoUrl,
              title: `Bukti Foto Absen ${record.type === 'MASUK' ? 'Masuk' : 'Pulang'}`,
              subtitle: `${record.dateStr} - ${record.timeStr} • ${record.userName}`,
            });
          }}
          onOpenRecapModal={() => setRecapModalOpen(true)}
        />
      )}

      {activeScreen === 'profile_menu' && (
        <ProfileMenuScreen
          onBack={() => setActiveScreen('dashboard')}
          onNavigate={(screen) => setActiveScreen(screen as ScreenType)}
          onOpenRecapModal={() => setRecapModalOpen(true)}
          onOpenPhotoProof={(record: AttendanceRecord) => {
            setPhotoProof({
              isOpen: true,
              imageUrl: record.photoUrl,
              title: `Bukti Foto Absen ${record.type === 'MASUK' ? 'Masuk' : 'Pulang'}`,
              subtitle: `${record.dateStr} - ${record.timeStr}`,
            });
          }}
          onContactAdmin={() => {
            alert('Menghubungi Koordinator SPPG: +62 812-3456-7890 (WhatsApp / Call)');
          }}
        />
      )}

      {activeScreen === 'edit_profile' && (
        <EditProfileScreen onBack={handleBack} />
      )}

      {activeScreen === 'role_management' && (
        <RoleManagementScreen onBack={() => setActiveScreen('profile_menu')} />
      )}

      {activeScreen === 'working_days' && (
        <WorkingDaysScreen onBack={() => setActiveScreen('profile_menu')} />
      )}

      {activeScreen === 'shift_management' && (
        <ShiftManagementScreen onBack={() => setActiveScreen('profile_menu')} />
      )}

      {activeScreen === 'working_hours' && (
        <WorkingHoursScreen onBack={() => setActiveScreen('profile_menu')} />
      )}

      {activeScreen === 'location_settings' && (
        <LocationSettingsScreen onBack={() => setActiveScreen('profile_menu')} />
      )}

      {activeScreen === 'member_list' && (
        <MemberListScreen onBack={() => setActiveScreen('profile_menu')} />
      )}

      {activeScreen === 'leave_form' && (
        <LeaveFormScreen
          onBack={() => setActiveScreen('profile_menu')}
          onSuccess={() => setActiveScreen('leave_history')}
        />
      )}

      {activeScreen === 'leave_history' && (
        <LeaveHistoryScreen
          onBack={() => setActiveScreen('profile_menu')}
          onViewProof={(req: LeaveRequest) => {
            setPhotoProof({
              isOpen: true,
              imageUrl: req.proofUrl || '',
              title: `Bukti Foto Absen ${req.type}`,
              subtitle: `${req.submittedAt} • ${req.userName}`,
            });
          }}
        />
      )}

      {activeScreen === 'face_registration' && (
        <FaceRegistrationScreen
          onBack={() => setActiveScreen('dashboard')}
          onSuccess={() => setActiveScreen('dashboard')}
        />
      )}

      {activeScreen === 'live_chat' && (
        <LiveChatScreen onBack={() => setActiveScreen('profile_menu')} />
      )}


      {/* Attendance Camera Scan Modal */}
      <AttendanceScanModal
        isOpen={attendanceModal.isOpen}
        type={attendanceModal.type}
        onClose={() => setAttendanceModal({ isOpen: false, type: 'MASUK' })}
        onSuccess={() => {
          setActiveScreen('attendance_history');
        }}
      />

      {/* Download Recap Modal */}
      <RecapModal
        isOpen={recapModalOpen}
        onClose={() => setRecapModalOpen(false)}
      />

      {/* Photo Proof Modal */}
      <PhotoProofModal
        isOpen={photoProof.isOpen}
        imageUrl={photoProof.imageUrl}
        title={photoProof.title}
        subtitle={photoProof.subtitle}
        onClose={() => setPhotoProof((prev) => ({ ...prev, isOpen: false }))}
      />
    </FullScreenLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
