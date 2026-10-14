import React, { useState } from 'react';
import { Search, Calendar, Paperclip, Check, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { Header } from '../common/Header';
import { useApp } from '../../context/AppContext';
import { LeaveRequest, canVerifyLeave, isDeveloperRole } from '../../types';

interface LeaveHistoryScreenProps {
  onBack: () => void;
  onViewProof: (req: LeaveRequest) => void;
}

export const LeaveHistoryScreen: React.FC<LeaveHistoryScreenProps> = ({ onBack, onViewProof }) => {
  const { leaveRequests, currentUser, updateLeaveStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Disetujui' | 'Menunggu' | 'Ditolak'>('ALL');

  const canVerify = canVerifyLeave(currentUser?.role);

  const filteredList = leaveRequests.filter((item) => {
    // If not having verification privileges, can only see their own requests
    if (!canVerify && item.userId !== currentUser?.id) {
      return false;
    }

    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }

    const matchesSearch =
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 select-none">
      <Header title="Riwayat Pengajuan Izin" onBack={onBack} />

      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, jenis izin, divisi, atau alasan..."
            className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#024b3a] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('Disetujui')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              statusFilter === 'Disetujui'
                ? 'bg-[#024b3a] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Disetujui
          </button>
          <button
            onClick={() => setStatusFilter('Menunggu')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              statusFilter === 'Menunggu'
                ? 'bg-[#024b3a] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Menunggu
          </button>
          <button
            onClick={() => setStatusFilter('Ditolak')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              statusFilter === 'Ditolak'
                ? 'bg-[#024b3a] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Ditolak
          </button>
        </div>

        {/* List of Leave Cards */}
        <div className="space-y-4">
          {filteredList.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-100 text-center text-xs text-slate-400 shadow-2xs">
              Tidak ada data riwayat pengajuan izin
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="relative bg-white rounded-3xl p-5 border border-slate-100 shadow-sm overflow-hidden space-y-3"
              >
                {/* Status Indicator Bar */}
                <div
                  className={`absolute left-0 inset-y-0 w-1.5 ${
                    item.status === 'Disetujui'
                      ? 'bg-emerald-600'
                      : item.status === 'Menunggu'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />

                {/* Top Row: Status badge & timestamp */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        item.status === 'Disetujui'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'Menunggu'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {item.status}
                    </span>

                    {item.verifiedBy && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Oleh: {item.verifiedBy}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {item.submittedAt}
                  </span>
                </div>

                {/* Title & User info */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {item.type}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Diajukan oleh: <strong className="text-slate-900">{item.userName}</strong> ({item.userRole || 'Anggota'} - {item.department || 'Operasional'})
                  </p>
                </div>

                {/* 1-Day Date */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Tanggal Izin: {item.dateStr}</span>
                </div>

                {/* Reason box */}
                <div className="bg-slate-50 rounded-2xl p-3.5">
                  <span className="block text-[11px] font-bold text-slate-400 mb-0.5">
                    Alasan:
                  </span>
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    {item.reason}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1">
                  {item.proofUrl ? (
                    <button
                      onClick={() => onViewProof(item)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#024b3a] transition-all cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Lihat Bukti Foto</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">
                      (Tanpa Lampiran Surat)
                    </span>
                  )}

                  {/* Koordinator & Pimpinan Approval Actions */}
                  {canVerify && item.status === 'Menunggu' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateLeaveStatus(item.id, 'Disetujui')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(item.id, 'Ditolak')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
