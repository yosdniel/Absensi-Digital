import React from 'react';
import { X, Printer, ShieldAlert, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { WarningLetter } from '../../types';
import { useApp } from '../../context/AppContext';

interface WarningLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: WarningLetter | null;
}

export const WarningLetterModal: React.FC<WarningLetterModalProps> = ({
  isOpen,
  onClose,
  letter,
}) => {
  const { settings } = useApp();

  if (!isOpen || !letter) return null;

  const isLevel3 = letter.level === 'SP 3';
  const isLevel2 = letter.level === 'SP 2';

  const badgeColor = isLevel3
    ? 'bg-red-600 text-white'
    : isLevel2
    ? 'bg-amber-600 text-white'
    : 'bg-yellow-500 text-slate-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-slate-100/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#024b3a]" />
            <span className="text-xs font-bold text-slate-700">
              Dokumen Resmi Surat Peringatan (SP)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Cetak Salinan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900">
          {/* Official Letterhead (Kop Surat SPPG) */}
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-slate-900">
              SATUAN PELAYANAN PEMENUHAN GIZI (SPPG)
            </h2>
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-900">
              {settings.name || 'SPPG MANDIRI SEJAHTERA'} ({settings.code || 'SPPG-MDR'})
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              {settings.address || 'Jl. Tugu No. 1, Malang'} • Telp: {settings.phone || '(0341) 362222'} • Email: {settings.email || 'info@sppg.id'}
            </p>
          </div>

          {/* Letter Title & Number */}
          <div className="text-center space-y-1.5">
            <div className="inline-block">
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badgeColor}`}>
                {letter.level} (SURAT PERINGATAN)
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-700">
              Nomor: {letter.letterNumber}
            </div>
            <div className="text-[11px] text-slate-500">
              Perihal: <strong>{letter.reasonCategory}</strong>
            </div>
          </div>

          {/* Salutation & Recipient Info */}
          <div className="text-xs space-y-3 leading-relaxed">
            <p>
              Surat Peringatan ini diterbitkan oleh Pengelola SPPG kepada karyawan yang bersangkutan di bawah ini:
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1.5 font-medium">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Nama Karyawan</span>
                <span className="col-span-2 font-bold text-slate-900">: {letter.userName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">ID Karyawan</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">: {letter.userId}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Jabatan / Role</span>
                <span className="col-span-2 font-bold text-[#024b3a]">: {letter.userRole}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Divisi / Unit</span>
                <span className="col-span-2 font-bold text-slate-900">: {letter.department}</span>
              </div>
            </div>
          </div>

          {/* Violation Details */}
          <div className="text-xs space-y-2 leading-relaxed">
            <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
              A. Pokok Permasalahan & Pelanggaran:
            </h4>
            <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 text-slate-800 leading-relaxed font-medium">
              {letter.description}
            </div>
          </div>

          {/* Validity & Directives */}
          <div className="text-xs space-y-2 leading-relaxed">
            <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
              B. Ketentuan & Masa Berlaku:
            </h4>
            <p className="text-slate-600">
              1. Surat Peringatan ini berlaku terhitung sejak tanggal{' '}
              <strong>{letter.issuedDate}</strong> sampai dengan tanggal{' '}
              <strong>{letter.validUntil}</strong>.<br />
              2. Karyawan wajib memperbaiki kedisiplinan dan kepatuhan terhadap jadwal jam kerja dan SOP operasional SPPG.<br />
              3. Apabila terjadi pelanggaran berulang selama masa berlakunya SP ini, instansi berhak menerbitkan sanksi disipliner tahap berikutnya.
            </p>
          </div>

          {/* Signatures & Stamps */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-xs">
            <div className="space-y-12">
              <div>
                <p className="text-[11px] text-slate-500">Karyawan Yang Bersangkutan,</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 uppercase underline">
                  {letter.userName}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">ID: {letter.userId}</p>
              </div>
            </div>

            <div className="space-y-12 relative">
              {/* Digital Stamp Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                <div className="w-24 h-24 rounded-full border-4 border-[#024b3a] flex items-center justify-center font-black text-xs text-[#024b3a] transform -rotate-12 uppercase">
                  TERVERIFIKASI SPPG
                </div>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Diterbitkan di Malang, {letter.issuedDate}
                </p>
                <p className="text-[11px] font-bold text-slate-700">
                  {letter.issuedByRole} SPPG,
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-900 uppercase underline">
                  {letter.issuedBy}
                </p>
                <p className="text-[10px] text-[#024b3a] font-bold">
                  {letter.issuedByRole} SPPG
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-bold text-slate-500">Status Dokumen:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                letter.status === 'Aktif'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {letter.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
