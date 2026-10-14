import React, { useState } from 'react';
import {
  Clock,
  SlidersHorizontal,
  Plus,
  Calendar,
  Search,
  Check,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  ShieldAlert,
  X,
} from 'lucide-react';
import { Header } from '../common/Header';
import { WarningLetterModal } from '../common/WarningLetterModal';
import { useApp } from '../../context/AppContext';
import { Shift, SPLevel, canIssueWarningLetter, User } from '../../types';

interface ShiftManagementScreenProps {
  onBack: () => void;
}

export const ShiftManagementScreen: React.FC<ShiftManagementScreenProps> = ({ onBack }) => {
  const { shifts, addShift, updateShift, users, plots, setPlot, bulkPlot, currentUser, addWarningLetter } = useApp();

  const [activeTab, setActiveTab] = useState<'master' | 'plotting'>('master');

  // Master Shift modal states
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    id: '',
    name: '',
    startTime: '08:00',
    endTime: '16:00',
  });

  // Warning Letter modal states
  const [showIssueSPModal, setShowIssueSPModal] = useState(false);
  const [userForSP, setUserForSP] = useState<User | null>(null);
  const [spLevel, setSpLevel] = useState<SPLevel>('SP 1');
  const [reasonCategory, setReasonCategory] = useState<
    | 'Keterlambatan Berulang'
    | 'Ketidakhadiran Tanpa Izin'
    | 'Pelanggaran SOP Sanitasi'
    | 'Kelalaian Tugas'
    | 'Pelanggaran Disiplin Kerja'
    | 'Lainnya'
  >('Keterlambatan Berulang');
  const [description, setDescription] = useState('');
  const [validMonths, setValidMonths] = useState(3);
  const [notes, setNotes] = useState('');

  const canIssue = canIssueWarningLetter(currentUser?.role);

  // Plotting tab states (matches screenshot 10)
  const [selectedDate, setSelectedDate] = useState('2026-04-16');
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'UNPLOTTED' | 'S1' | 'S2'>('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkShiftChoice, setBulkShiftChoice] = useState('S1');

  // Dates for the horizontal carousel (April 2026)
  const dateStrip = [
    { day: 'Sel', num: 7, dateStr: '2026-04-07' },
    { day: 'Rab', num: 8, dateStr: '2026-04-08' },
    { day: 'Kam', num: 9, dateStr: '2026-04-09' },
    { day: 'Jum', num: 10, dateStr: '2026-04-10' },
    { day: 'Sab', num: 11, dateStr: '2026-04-11' },
    { day: 'Min', num: 12, dateStr: '2026-04-12' },
    { day: 'Kam', num: 16, dateStr: '2026-04-16' },
  ];

  // Open Edit Shift modal
  const handleOpenEdit = (shift: Shift) => {
    setEditingShift(shift);
    setShiftForm({
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
    });
  };

  // Open Add Shift modal
  const handleOpenAdd = () => {
    const nextNum = shifts.length + 1;
    setShiftForm({
      id: `S${nextNum}`,
      name: '',
      startTime: '08:00',
      endTime: '16:00',
    });
    setIsAddingShift(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShift) {
      updateShift({
        id: shiftForm.id,
        name: shiftForm.name,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
      });
      setEditingShift(null);
    } else if (isAddingShift) {
      addShift({
        id: shiftForm.id,
        name: shiftForm.name || `Shift ${shiftForm.id}`,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
      });
      setIsAddingShift(false);
    }
  };

  const handleIssueSP = (user: User) => {
    setUserForSP(user);
    setShowIssueSPModal(true);
  };

  const handleIssueSPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForSP) return;

    const now = new Date();
    const issuedDate = now.toISOString().split('T')[0];

    // Calculate validUntil
    const validUntilDate = new Date();
    validUntilDate.setMonth(validUntilDate.getMonth() + validMonths);
    const validUntil = validUntilDate.toISOString().split('T')[0];

    addWarningLetter({
      userId: userForSP.id,
      userName: userForSP.name,
      userRole: userForSP.role,
      department: userForSP.department,
      level: spLevel,
      reasonCategory,
      description,
      issuedDate,
      validUntil,
      issuedBy: currentUser?.name || 'Staff',
      issuedByRole: currentUser?.role || 'Staff',
      status: 'Aktif',
      notes,
    });

    setDescription('');
    setNotes('');
    setShowIssueSPModal(false);
    setUserForSP(null);
  };

  // Plotting helpers
  const getUserPlotForDate = (userId: string, date: string): string => {
    const plot = plots.find((p) => p.userId === userId && p.date === date);
    return plot ? plot.shiftId : 'OFF';
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.id));
    }
  };

  const handleApplyBulkPlot = () => {
    bulkPlot(
      selectedDate,
      bulkShiftChoice,
      selectedUserIds.length > 0 ? selectedUserIds : undefined
    );
    setShowBulkModal(false);
  };

  // Filter users in Plotting
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const currentShift = getUserPlotForDate(u.id, selectedDate);
    if (shiftFilter === 'UNPLOTTED') return currentShift === 'OFF';
    if (shiftFilter === 'S1') return currentShift === 'S1';
    if (shiftFilter === 'S2') return currentShift === 'S2';
    return true;
  });

  // Helper to check for overlapping shifts
  const checkOverlappingShifts = (shiftsList: Shift[]): string[] => {
    const overlaps: string[] = [];
    for (let i = 0; i < shiftsList.length; i++) {
      for (let j = i + 1; j < shiftsList.length; j++) {
        const s1 = shiftsList[i];
        const s2 = shiftsList[j];
        
        // Convert to minutes
        const [h1s, m1s] = s1.startTime.split(':').map(Number);
        const [h1e, m1e] = s1.endTime.split(':').map(Number);
        const [h2s, m2s] = s2.startTime.split(':').map(Number);
        const [h2e, m2e] = s2.endTime.split(':').map(Number);

        const start1 = h1s * 60 + m1s;
        const end1 = h1e * 60 + m1e;
        const start2 = h2s * 60 + m2s;
        const end2 = h2e * 60 + m2e;

        if (start1 < end2 && start2 < end1) {
          if (!overlaps.includes(s1.id)) overlaps.push(s1.id);
          if (!overlaps.includes(s2.id)) overlaps.push(s2.id);
        }
      }
    }
    return overlaps;
  };

  const overlappingShiftIds = checkOverlappingShifts(shifts);

  return (
    <div className="relative min-h-full flex flex-col bg-[#f4f7fb] pb-36 select-none">
      <Header title="Manajemen Shift" onBack={onBack} />
      
      {/* Alert for overlapping shifts */}
      {overlappingShiftIds.length > 0 && (
        <div className="mx-5 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <div className="text-amber-600">
             <Layers className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-amber-800">
            Perhatian: Terdapat shift yang tumpang tindih: {overlappingShiftIds.join(', ')}
          </p>
        </div>
      )}

      {/* Tabs matching screenshot 3 & 10 */}
      <div className="px-5 mb-4">
        <div className="flex bg-[#034d3d]/15 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('master')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'master'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Master
          </button>
          <button
            onClick={() => setActiveTab('plotting')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'plotting'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Plotting
          </button>
        </div>
      </div>

      {/* MASTER TAB CONTENT (matches screenshot 3) */}
      {activeTab === 'master' && (
        <div className="px-5 space-y-3">
          {/* Top action header so user never misses the button */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Template Shift ({shifts.length})
              </h4>
              <p className="text-[11px] text-slate-400">
                Kelola jam kerja & rentang waktu kehadiran
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#024b3a] text-white font-bold text-xs shadow-md shadow-[#024b3a]/25 hover:bg-[#023f31] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Shift</span>
            </button>
          </div>

          {shifts.map((shift, idx) => (
            <div
              key={shift.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    idx === 0
                      ? 'bg-blue-50 text-blue-700'
                      : idx === 1
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Clock className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {shift.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => handleOpenEdit(shift)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors"
                title="Edit Shift"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Floating "+ Tambah Shift" Button safely elevated above bottom nav */}
          <div className="fixed bottom-24 md:bottom-8 inset-x-0 px-5 max-w-md mx-auto pointer-events-none z-30">
            <button
              onClick={handleOpenAdd}
              className="pointer-events-auto ml-auto flex items-center gap-2 py-3.5 px-6 rounded-2xl bg-[#024b3a] text-white font-bold text-sm shadow-xl shadow-[#024b3a]/40 hover:bg-[#023f31] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Shift</span>
            </button>
          </div>
        </div>
      )}

      {/* PLOTTING TAB CONTENT (matches screenshot 10) */}
      {activeTab === 'plotting' && (
        <div className="px-5 space-y-4">
          {/* Date Selector Horizontal Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="w-10 h-13 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>

            {dateStrip.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'bg-white border-2 border-[#024b3a] text-slate-900 shadow-xs'
                      : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {item.day}
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {item.num}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar matching screenshot 10 */}
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-100 shadow-2xs px-3.5 py-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau ID karyawan..."
              className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setShiftFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                shiftFilter === 'ALL'
                  ? 'bg-[#024b3a] text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setShiftFilter('UNPLOTTED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                shiftFilter === 'UNPLOTTED'
                  ? 'bg-[#024b3a] text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Belum Ter-plot
            </button>
            <button
              onClick={() => setShiftFilter('S1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                shiftFilter === 'S1'
                  ? 'bg-[#024b3a] text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Shift S1
            </button>
            <button
              onClick={() => setShiftFilter('S2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                shiftFilter === 'S2'
                  ? 'bg-[#024b3a] text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Shift S2
            </button>
          </div>

          {/* Daftar Karyawan header & Pilih Semua & Plot Massal shortcut */}
          <div className="flex items-center justify-between pt-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="flex items-center gap-3">
              <h4 className="text-xs font-extrabold text-slate-800">
                Karyawan ({filteredUsers.length})
              </h4>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer hover:text-slate-900"
              >
                {selectedUserIds.length === users.length && users.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-[#024b3a]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Pilih Semua</span>
              </button>
            </div>

            <button
              onClick={() => setShowBulkModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#024b3a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#023f31] transition-transform active:scale-95 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plot Massal</span>
            </button>
          </div>

          {/* Schedule Preview */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
            <h4 className="text-xs font-extrabold text-slate-800 mb-3">Pratinjau Jadwal: {selectedDate}</h4>
            <div className="space-y-2">
              {users.filter(u => getUserPlotForDate(u.id, selectedDate) !== 'OFF').length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada karyawan yang diplot.</p>
              ) : (
                users
                  .filter(u => getUserPlotForDate(u.id, selectedDate) !== 'OFF')
                  .map(u => (
                    <div key={u.id} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">{u.name}</span>
                      <span className="font-mono font-bold text-[#024b3a] bg-emerald-50 px-2 py-0.5 rounded">
                        {getUserPlotForDate(u.id, selectedDate)}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* List of Employees with shift toggle pills */}
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const currentShift = getUserPlotForDate(user.id, selectedDate);
              const isSelected = selectedUserIds.includes(user.id);

              return (
                <div
                  key={user.id}
                  className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#024b3a] font-bold flex items-center justify-center text-sm uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">
                          {user.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {user.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleIssueSP(user)}
                        className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                        title="Terbitkan Surat Peringatan"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          // Quick cycle shift
                          const options = ['OFF', 'S1', 'S2'];
                          const nextIdx = (options.indexOf(currentShift) + 1) % options.length;
                          setPlot(user.id, selectedDate, options[nextIdx]);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#024b3a] text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Plot</span>
                      </button>

                      <button
                        onClick={() => toggleUserSelection(user.id)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#024b3a]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Shift Selection Pills (OFF, S1, S2, etc.) */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                    <button
                      onClick={() => setPlot(user.id, selectedDate, 'OFF')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentShift === 'OFF'
                          ? 'bg-slate-700 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      OFF
                    </button>

                    {shifts.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setPlot(user.id, selectedDate, s.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          currentShift === s.id
                            ? 'bg-[#024b3a] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s.id}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating "Plot Massal Semua" Button safely elevated above bottom nav */}
          <div className="fixed bottom-24 md:bottom-8 inset-x-0 px-5 max-w-md mx-auto pointer-events-none z-30">
            <button
              onClick={() => setShowBulkModal(true)}
              className="pointer-events-auto ml-auto flex items-center gap-2 py-3.5 px-6 rounded-2xl bg-[#024b3a] text-white font-bold text-sm shadow-xl shadow-[#024b3a]/40 hover:bg-[#023f31] active:scale-95 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 stroke-[2]" />
              <span>Plot Massal Semua</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE NEW WARNING LETTER */}
      {showIssueSPModal && userForSP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Terbitkan Surat Peringatan (SP)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Karyawan: {userForSP.name} ({userForSP.id})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIssueSPModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueSPSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkat Peringatan *
                  </label>
                  <select
                    value={spLevel}
                    onChange={(e) => setSpLevel(e.target.value as SPLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value="SP 1">SP 1 (Peringatan Pertama)</option>
                    <option value="SP 2">SP 2 (Peringatan Kedua)</option>
                    <option value="SP 3">SP 3 (Peringatan Terakhir)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Masa Berlaku
                  </label>
                  <select
                    value={validMonths}
                    onChange={(e) => setValidMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value={1}>1 Bulan</option>
                    <option value={3}>3 Bulan (Standar)</option>
                    <option value={6}>6 Bulan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Pelanggaran *
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) =>
                    setReasonCategory(
                      e.target.value as
                        | 'Keterlambatan Berulang'
                        | 'Ketidakhadiran Tanpa Izin'
                        | 'Pelanggaran SOP Sanitasi'
                        | 'Kelalaian Tugas'
                        | 'Pelanggaran Disiplin Kerja'
                        | 'Lainnya'
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="Keterlambatan Berulang">Keterlambatan Berulang</option>
                  <option value="Ketidakhadiran Tanpa Izin">Ketidakhadiran Tanpa Izin (Alpa)</option>
                  <option value="Pelanggaran SOP Sanitasi">Pelanggaran SOP Sanitasi & Cuci Ompreng</option>
                  <option value="Kelalaian Tugas">Kelalaian Tugas Produksi / Distribusi</option>
                  <option value="Pelanggaran Disiplin Kerja">Pelanggaran Disiplin Kerja</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Uraian Detail Pelanggaran & Instruksi Perbaikan *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan fakta pelanggaran, tanggal kejadian, serta komitmen perbaikan yang wajib dipenuhi..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 focus:outline-hidden resize-none font-medium leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueSPModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                >
                  Terbitkan Dokumen SP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Shift (matches screenshot 3) or Tambah Shift Baru (matches screenshot 7) */}
      {(editingShift || isAddingShift) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-5">
              {editingShift ? 'Edit Shift' : 'Tambah Shift Baru'}
            </h3>

            <form onSubmit={handleSaveShift} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  ID Shift
                </label>
                <input
                  type="text"
                  value={shiftForm.id}
                  onChange={(e) => setShiftForm({ ...shiftForm, id: e.target.value })}
                  placeholder="Contoh: S2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#024b3a]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Nama Shift
                </label>
                <input
                  type="text"
                  value={shiftForm.name}
                  onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                  placeholder="Contoh: Siang"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#024b3a]/20"
                  required
                />
              </div>

              {/* Masuk & Pulang times side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 mb-1">
                    Masuk
                  </span>
                  <input
                    type="time"
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full bg-transparent font-extrabold text-base text-slate-900 text-center focus:outline-hidden"
                    required
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 mb-1">
                    Pulang
                  </span>
                  <input
                    type="time"
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full bg-transparent font-extrabold text-base text-slate-900 text-center focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Action buttons matching screenshot 3 & 7 */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingShift(null);
                    setIsAddingShift(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#024b3a] text-white font-bold text-sm shadow-md hover:bg-[#023f31] active:scale-95 transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Plot Massal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
              Plot Massal Shift
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Terapkan shift ke {selectedUserIds.length > 0 ? `${selectedUserIds.length} karyawan terpilih` : 'semua karyawan'} pada tanggal {selectedDate}.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setBulkShiftChoice('OFF')}
                className={`py-3 rounded-2xl font-bold text-xs border ${
                  bulkShiftChoice === 'OFF'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                OFF
              </button>
              {shifts.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setBulkShiftChoice(s.id)}
                  className={`py-3 rounded-2xl font-bold text-xs border ${
                    bulkShiftChoice === s.id
                      ? 'bg-[#024b3a] text-white border-[#024b3a]'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {s.id} ({s.name})
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyBulkPlot}
                className="px-5 py-2.5 rounded-xl bg-[#024b3a] text-white text-xs font-bold shadow-md hover:bg-[#023f31]"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
