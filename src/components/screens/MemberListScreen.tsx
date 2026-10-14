import React, { useState } from 'react';
import {
  Search,
  Phone,
  Smile,
  Frown,
  Smartphone,
  Shield,
  Plus,
  X,
  PhoneCall,
  UserPlus,
  KeyRound,
  Edit2,
  Trash2,
  Check,
  Building,
  ShieldAlert,
} from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import { User, SPLevel, canIssueWarningLetter } from '../../types';

interface MemberListScreenProps {
  onBack: () => void;
}

export const MemberListScreen: React.FC<MemberListScreenProps> = ({ onBack }) => {
  const { users, addUser, updateUser, deleteUser, roles, currentUser, addWarningLetter } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [activeCallUser, setActiveCallUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  // Form states
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('123456');
  const [role, setRole] = useState(roles[3]?.name || 'STAFF');
  const [department, setDepartment] = useState('Operasional');
  const [phone, setPhone] = useState('08123456789');

  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean)));

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDivision = divisionFilter === 'ALL' || u.department === divisionFilter;
    
    return matchesSearch && matchesDivision;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setId(`KRY-${String(users.length + 1).padStart(3, '0')}`);
    setEmail(`karyawan${users.length + 1}@hadirin.id`);
    setPin('123456');
    setRole(roles[3]?.name || 'STAFF');
    setDepartment('Operasional');
    setPhone('08123456789');
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setId(user.id);
    setEmail(user.email);
    setPin(user.pin);
    setRole(user.role);
    setDepartment(user.department || '');
    setPhone(user.phone);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name: name.trim(),
        email: email.trim(),
        pin: pin.trim(),
        role: role,
        department: department.trim(),
        phone: phone.trim(),
        phoneRegistered: Boolean(phone.trim()),
      });
    } else {
      addUser({
        id: id.trim() || `KRY-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        pin: pin.trim() || '123456',
        role: role,
        phone: phone.trim(),
        phoneRegistered: Boolean(phone.trim()),
        faceRegistered: false,
        department: department.trim(),
      });
    }

    setShowAddModal(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Yakin ingin menghapus data karyawan "${userName}"?`)) {
      deleteUser(userId);
    }
  };

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) newSelected.delete(userId);
    else newSelected.add(userId);
    setSelectedUsers(newSelected);
  };

  const handleIssueSP = (user: User) => {
    setUserForSP(user);
    setBulkMode(false);
    setShowIssueSPModal(true);
  };

  const handleBulkIssueSP = () => {
    if (selectedUsers.size === 0) return;
    setBulkMode(true);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Header
        title="Daftar Anggota & Registrasi"
        onBack={onBack}
        rightAction={
          <button
            onClick={handleOpenAdd}
            className="w-10 h-10 rounded-2xl bg-[#024b3a] text-white flex items-center justify-center hover:bg-[#023f31] transition-transform active:scale-95 shadow-md shadow-[#024b3a]/25"
            title="Tambah Anggota"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        }
      />

      <div className="space-y-4">
        {/* Search bar & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-grow flex items-center bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, ID, email, atau jabatan..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Semua Divisi</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Member Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredUsers.map((user) => {
            const isAdmin = user.role === 'Developer' || user.role === 'Kepala SPPG';

            return (
              <div
                key={user.id}
                className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                      {user.facePhotoUrl ? (
                        <img
                          src={user.facePhotoUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="font-extrabold text-[#024b3a] text-lg uppercase">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name & ID */}
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {user.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {user.id} • <span className="font-bold text-[#024b3a]">{user.role}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* SP button */}
                    <button
                      onClick={() => handleIssueSP(user)}
                      className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                      title="Terbitkan Surat Peringatan"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>

                    {/* Phone button */}
                    <button
                      onClick={() => setActiveCallUser(user)}
                      className="w-9 h-9 rounded-xl bg-[#e3f5ed] text-[#059669] flex items-center justify-center hover:bg-[#d4f0e4] active:scale-95 transition-all"
                      title={`Hubungi ${user.name}`}
                    >
                      <Phone className="w-4 h-4 fill-[#059669]" />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
                      title="Edit Data Karyawan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button (except main admin) */}
                    {user.id !== 'INST-244385' && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center active:scale-95 transition-all"
                        title="Hapus Karyawan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-50 text-[11px]">
                  {/* PIN Display for Admin */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-mono font-bold">
                    <KeyRound className="w-3 h-3" />
                    <span>PIN: {user.pin}</span>
                  </div>

                  {/* Face Badge */}
                  {user.faceRegistered ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                      <Smile className="w-3 h-3 text-emerald-600" />
                      <span>Wajah Terdaftar</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold">
                      <Frown className="w-3 h-3 text-rose-500" />
                      <span>Belum Ada Wajah</span>
                    </div>
                  )}

                  {/* Phone Badge */}
                  {user.phoneRegistered && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                      <Smartphone className="w-3 h-3 text-teal-700" />
                      <span>HP Terdaftar</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CALL MODAL PROMPT */}
      {activeCallUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Hubungi {activeCallUser.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-6">
              {activeCallUser.phone || '0812-3456-7890'}
            </p>

            <div className="space-y-2">
              <a
                href={`tel:${activeCallUser.phone}`}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#024b3a] text-white font-bold text-sm shadow-md hover:bg-[#023f31] flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Panggilan Telepon Langsung</span>
              </a>

              <a
                href={`https://wa.me/${(activeCallUser.phone || '08123456789').replace(/^0/, '62')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <span>Kirim Pesan WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setActiveCallUser(null)}
                className="w-full py-3 px-4 rounded-xl text-slate-500 font-semibold text-xs hover:bg-slate-100 mt-2"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingUser ? 'Edit Data Karyawan' : 'Daftarkan Karyawan Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Siti Rahma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ID Pengguna *
                  </label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    disabled={Boolean(editingUser)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-hidden disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Keamanan *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-extrabold text-slate-800 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan / Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Departemen
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Operasional"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Kantor
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@hadirin.id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#024b3a] text-white text-xs font-bold shadow-md hover:bg-[#023f31]"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
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

    </div>
  );
};
