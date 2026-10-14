import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  X,
  UserCheck,
} from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import { WarningLetter, SPLevel, SPStatus, canIssueWarningLetter } from '../../types';
import { WarningLetterModal } from '../common/WarningLetterModal';

interface WarningLettersScreenProps {
  onBack: () => void;
}

export const WarningLettersScreen: React.FC<WarningLettersScreenProps> = ({ onBack }) => {
  const {
    currentUser,
    users,
    warningLetters,
    addWarningLetter,
    updateWarningLetterStatus,
    deleteWarningLetter,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | SPLevel>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SPStatus>('ALL');

  // Preview modal state
  const [selectedLetter, setSelectedLetter] = useState<WarningLetter | null>(null);

  // Issue SP modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [recipientId, setRecipientId] = useState('');
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

  // Filter letters
  const filteredLetters = warningLetters.filter((l) => {
    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false;
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        l.userName.toLowerCase().includes(q) ||
        l.userId.toLowerCase().includes(q) ||
        l.letterNumber.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q) ||
        l.reasonCategory.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const activeSPCount = warningLetters.filter((l) => l.status === 'Aktif').length;
  const sp1Count = warningLetters.filter((l) => l.level === 'SP 1' && l.status === 'Aktif').length;
  const sp2Count = warningLetters.filter((l) => l.level === 'SP 2' && l.status === 'Aktif').length;
  const sp3Count = warningLetters.filter((l) => l.level === 'SP 3' && l.status === 'Aktif').length;

  const handleOpenIssue = () => {
    if (!canIssue) {
      alert('Hanya Developer, Kepala SPPG, dan Staff yang dapat menerbitkan Surat Peringatan.');
      return;
    }
    if (users.length > 0) {
      setRecipientId(users[0].id);
    }
    setShowIssueModal(true);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.id === recipientId);
    if (!targetUser) return;

    const now = new Date();
    const issuedDate = now.toISOString().split('T')[0];

    // Calculate validUntil
    const validUntilDate = new Date();
    validUntilDate.setMonth(validUntilDate.getMonth() + validMonths);
    const validUntil = validUntilDate.toISOString().split('T')[0];

    addWarningLetter({
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      department: targetUser.department,
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
    setShowIssueModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 select-none">
      <Header
        title="Surat Peringatan (SP)"
        onBack={onBack}
        rightAction={
          canIssue ? (
            <button
              onClick={handleOpenIssue}
              className="px-3.5 py-2 rounded-2xl bg-[#024b3a] text-white font-bold text-xs shadow-xs hover:bg-[#023f31] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Terbitkan SP</span>
            </button>
          ) : undefined
        }
      />

      <div className="space-y-4">
        {/* Banner Hak Akses Penerbitan SP */}
        <div className="p-4.5 bg-rose-50/90 border border-rose-100 rounded-3xl flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold text-slate-900">
              Pengelolaan Disiplin & Surat Peringatan (SP 1, SP 2, SP 3)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Surat Peringatan diberikan secara resmi oleh <strong>Developer</strong>,{' '}
              <strong>Kepala SPPG</strong>, atau <strong>Staff</strong> terhadap pelanggaran kehadiran, keterlambatan berulang, atau ketidaksesuaian SOP kerja.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2.5">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs text-center">
            <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">
              Total SP Aktif
            </span>
            <span className="text-lg font-black text-slate-900">{activeSPCount}</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs text-center">
            <span className="block text-[10px] text-yellow-600 font-bold uppercase mb-0.5">
              SP 1 (Pertama)
            </span>
            <span className="text-lg font-black text-yellow-700">{sp1Count}</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs text-center">
            <span className="block text-[10px] text-amber-600 font-bold uppercase mb-0.5">
              SP 2 (Kedua)
            </span>
            <span className="text-lg font-black text-amber-700">{sp2Count}</span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs text-center">
            <span className="block text-[10px] text-red-600 font-bold uppercase mb-0.5">
              SP 3 (Ketiga)
            </span>
            <span className="text-lg font-black text-red-600">{sp3Count}</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-3">
          <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-3.5 py-2.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama karyawan, ID, nomor SP, divisi..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Level filter */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLevelFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  levelFilter === 'ALL'
                    ? 'bg-[#024b3a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Level
              </button>
              <button
                onClick={() => setLevelFilter('SP 1')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  levelFilter === 'SP 1'
                    ? 'bg-yellow-500 text-slate-900 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                SP 1
              </button>
              <button
                onClick={() => setLevelFilter('SP 2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  levelFilter === 'SP 2'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                SP 2
              </button>
              <button
                onClick={() => setLevelFilter('SP 3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  levelFilter === 'SP 3'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                SP 3
              </button>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Status: Semua
              </button>
              <button
                onClick={() => setStatusFilter('Aktif')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'Aktif'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-amber-700 hover:bg-slate-200'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setStatusFilter('Selesai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'Selesai'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-emerald-700 hover:bg-slate-200'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>

        {/* Warning Letters List */}
        <div className="space-y-3">
          {filteredLetters.length === 0 ? (
            <div className="p-10 bg-white rounded-3xl border border-slate-100 text-center text-xs text-slate-400 shadow-2xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto opacity-70" />
              <p>Tidak ada catatan Surat Peringatan yang sesuai filter.</p>
            </div>
          ) : (
            filteredLetters.map((letter) => {
              const isLevel3 = letter.level === 'SP 3';
              const isLevel2 = letter.level === 'SP 2';
              const badgeBg = isLevel3
                ? 'bg-red-50 text-red-700 border-red-200'
                : isLevel2
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-yellow-50 text-yellow-800 border-yellow-200';

              return (
                <div
                  key={letter.id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase border shrink-0 ${badgeBg}`}
                      >
                        {letter.level}
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {letter.userName}{' '}
                          <span className="text-xs font-mono font-normal text-slate-400">
                            ({letter.userId})
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {letter.userRole} • {letter.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        No: {letter.letterNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          letter.status === 'Aktif'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {letter.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="text-xs font-bold text-slate-800">
                      Perihal: {letter.reasonCategory}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {letter.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-50 text-[11px] text-slate-400">
                    <div>
                      Diterbitkan oleh: <strong className="text-slate-700">{letter.issuedBy}</strong> ({letter.issuedByRole}) • Berlaku s/d: <strong className="text-slate-700">{letter.validUntil}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View document */}
                      <button
                        onClick={() => setSelectedLetter(letter)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Buka Dokumen Resmi"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Surat</span>
                      </button>

                      {/* Status toggle for staff/admin */}
                      {canIssue && (
                        <button
                          onClick={() => {
                            const nextStatus = letter.status === 'Aktif' ? 'Selesai' : 'Aktif';
                            updateWarningLetterStatus(letter.id, nextStatus);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            letter.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          {letter.status === 'Aktif' ? 'Tandai Selesai' : 'Aktifkan Kembali'}
                        </button>
                      )}

                      {/* Delete button (Developer only) */}
                      {currentUser?.role === 'Developer' && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus surat peringatan ${letter.letterNumber}?`)) {
                              deleteWarningLetter(letter.id);
                            }
                          }}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus SP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: ISSUE NEW WARNING LETTER */}
      {showIssueModal && (
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
                    Diterbitkan oleh {currentUser?.name} ({currentUser?.role})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIssueModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Karyawan Penerima SP *
                </label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  required
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.id} - {u.role} • {u.department})
                    </option>
                  ))}
                </select>
              </div>

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
                  onClick={() => setShowIssueModal(false)}
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

      {/* Official Printable Preview Modal */}
      <WarningLetterModal
        isOpen={Boolean(selectedLetter)}
        letter={selectedLetter}
        onClose={() => setSelectedLetter(null)}
      />
    </div>
  );
};
