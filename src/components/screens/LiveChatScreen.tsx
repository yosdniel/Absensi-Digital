import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Users,
  Plus,
  X,
  ChevronRight,
  ArrowLeft,
  Clock,
  Sparkles,
  Heart,
  Smile,
  Lock,
  Tag,
  Search,
  Bot,
  HelpCircle,
  Briefcase,
  Check,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  SupportTicket,
  TicketStatus,
  TicketCategory,
  TicketPriority,
  ChatMessage,
} from '../../types';

interface LiveChatScreenProps {
  onBack: () => void;
}

const TICKET_CATEGORIES: TicketCategory[] = [
  'Presensi & Geofence',
  'Pengajuan Izin / Sakit',
  'Jadwal & Shift',
  'Fasilitas & Dapur SPPG',
  'Kendala Akun & PIN',
  'Umum',
];

interface FaqItem {
  id: string;
  category: TicketCategory;
  shortLabel: string;
  question: string;
  keywords: string[];
  answer: string;
}

const KNOWLEDGE_FAQ_LIST: FaqItem[] = [
  {
    id: 'FAQ-GPS',
    category: 'Presensi & Geofence',
    shortLabel: '📍 Masalah Radius GPS',
    question: 'Bagaimana cara mengatasi lokasi di luar radius kantor saat presensi?',
    keywords: ['gps', 'radius', 'luar radius', 'titik', 'lokasi', 'jarak', 'meter', 'peta', 'geofence', 'akurasi'],
    answer: `Halo! Berikut langkah penanganan jika GPS Anda terbaca di luar radius kantor SPPG:
1. Pastikan fitur Lokasi (GPS) ponsel aktif dengan mode "Akurasi Tinggi" (High Accuracy).
2. Hindari berada di dalam basement tebal atau ruangan tertutup baja yang memblokir sinyal satelit.
3. Buka modal presensi dan klik tombol "Cek Ulang GPS" untuk menyegarkan koordinat terkini.
4. Pastikan tidak ada aplikasi Fake GPS / Mock Location yang aktif di ponsel Anda karena sistem akan mendeteksi dan memblokir presensi otomatis.`,
  },
  {
    id: 'FAQ-TOLERANSI',
    category: 'Presensi & Geofence',
    shortLabel: '⏱️ Toleransi Keterlambatan',
    question: 'Berapa batas toleransi keterlambatan jam masuk kerja?',
    keywords: ['terlambat', 'telat', 'toleransi', 'jam masuk', 'menit', 'batas jam', 'potongan'],
    answer: `Ketentuan Jam Masuk & Toleransi SPPG:
• Sistem memberikan batas toleransi keterlambatan sebesar +15 menit setelah batas jam masuk divisi.
• Jika Anda presensi sebelum atau tepat pada batas waktu toleransi, status absensi tercatat "TEPAT WAKTU".
• Jika presensi melampaui batas toleransi (+15 menit), status otomatis tercatat "TERLAMBAT" beserta rincian jumlah menit keterlambatannya.`,
  },
  {
    id: 'FAQ-IZIN',
    category: 'Pengajuan Izin / Sakit',
    shortLabel: '🏥 Alur Izin Sakit 1 Hari',
    question: 'Bagaimana prosedur permohonan izin sakit atau cuti 1 hari?',
    keywords: ['izin', 'sakit', 'cuti', 'surat dokter', 'tidak masuk', 'halangan', 'demam'],
    answer: `Alur Pengajuan Izin / Sakit di SPPG:
1. Pengajuan izin berlaku untuk 1 hari (harian) demi kelancaran penjadwalan divisi dapur.
2. Anda dapat mengajukan langsung melalui tombol cepat "Izin Sakit" di ruang chat ini atau via menu Formulir Izin.
3. Cantumkan alasan jelas (misal: sakit demam/keperluan mendesak).
4. Staff dan Kepala SPPG akan memverifikasi dan segera menugaskan Anggota Pengganti agar operasional dapur tetap berjalan normal.`,
  },
  {
    id: 'FAQ-JADWAL',
    category: 'Jadwal & Shift',
    shortLabel: '📅 Jadwal Hari Kerja Divisi',
    question: 'Kapan hari masuk operasional untuk masing-masing divisi?',
    keywords: ['jadwal', 'hari kerja', 'shift', 'minggu', 'senin', 'sabtu', 'libur', 'security', 'pengolahan', 'persiapan'],
    answer: `Ketentuan Hari Masuk Kerja Divisi SPPG:
• Divisi Persiapan & Divisi Pengolahan: Mulai masuk hari MINGGU guna persiapan stok bahan makanan dan produksi awal.
• Divisi Keamanan (Security): Masuk kerja hari SENIN s/d SABTU (Hari Minggu Libur).
• Divisi Pemorsian, Distribusi, Cuci, dan Staff: Mulai masuk hari SENIN s/d JUMAT.`,
  },
  {
    id: 'FAQ-REKAP',
    category: 'Umum',
    shortLabel: '📊 Siklus Rekap 2 Minggu',
    question: 'Bagaimana pembagian periode rekapitulasi absensi 2 mingguan?',
    keywords: ['rekap', 'periode', '2 minggu', 'dua minggu', 'unduh', 'spreadsheet', 'csv', 'laporan'],
    answer: `Siklus Rekapitulasi Absensi SPPG:
• 1 Periode Rekap dihitung per 2 MINGGU SEKALI.
  - Periode 1: Tanggal 01 s/d 14 (14 hari pertama).
  - Periode 2: Tanggal 15 s/d Akhir Bulan (14-17 hari kedua).
• Staff, Kepala SPPG, dan Developer dapat mengunduh laporan rekapitulasi format CSV/Spreadsheet melalui tombol Rekap di Dasbor atau Riwayat Absensi.`,
  },
  {
    id: 'FAQ-SCAN',
    category: 'Presensi & Geofence',
    shortLabel: '👤 Verifikasi Scan Wajah',
    question: 'Mengapa scan wajah gagal dan bagaimana verifikasi liveness bekerja?',
    keywords: ['wajah', 'muka', 'scan', 'kamera', 'kedip', 'liveness', 'gagal', 'spoofing', 'statis', 'biometrik'],
    answer: `Panduan Scan Wajah Anti-Manipulasi:
1. Posisikan wajah tegak di dalam lingkaran panduan oval.
2. Ikuti instruksi liveness: kedipkan mata atau tersenyum/mengangguk sedikit untuk membuktikan wajah manusia asli hidup.
3. Pastikan pencahayaan cukup dan wajah tidak terhalang masker tebal.
4. Sistem dilengkapi Anti-Spoofing yang otomatis menolak foto cetak atau foto dari layar HP lain.`,
  },
  {
    id: 'FAQ-SP',
    category: 'Umum',
    shortLabel: '⚠️ Surat Peringatan (SP)',
    question: 'Kapan Surat Peringatan (SP) diterbitkan?',
    keywords: ['sp', 'peringatan', 'surat peringatan', 'sanksi', 'disiplin', 'hukuman'],
    answer: `Ketentuan Penerbitan Surat Peringatan (SP):
• SP dapat diterbitkan oleh Developer, Kepala SPPG, atau Staff bagi karyawan yang melakukan keterlambatan berulang (>3 kali), ketidakhadiran tanpa keterangan, atau kelalaian SOP sanitasi dapur.
• Tingkatan: SP 1 (masa berlaku 3 bulan), SP 2 (masa berlaku 6 bulan), hingga SP 3.`,
  },
];

export const LiveChatScreen: React.FC<LiveChatScreenProps> = ({ onBack }) => {
  const {
    currentUser,
    users,
    supportTickets,
    chatMessages,
    createSupportTicket,
    updateTicketStatus,
    closeSupportTicket,
    claimSupportTicket,
    sendTicketMessage,
    toggleMessageLike,
    assignSubstitute,
    settings,
  } = useApp();

  const isStaffOrHead =
    currentUser?.role === 'Developer' ||
    currentUser?.role === 'Kepala SPPG' ||
    currentUser?.role === 'Staff';

  // Filtered tickets based on role and tab
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // New Ticket Modal state
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<TicketCategory>('Presensi & Geofence');
  const [newTicketPriority, setNewTicketPriority] = useState<TicketPriority>('SEDANG');
  const [newTicketMessage, setNewTicketMessage] = useState('');

  // Close Ticket Modal state
  const [showCloseTicketModal, setShowCloseTicketModal] = useState(false);
  const [closeNoteInput, setCloseNoteInput] = useState('');

  // FAQ Modal state
  const [showFaqModal, setShowFaqModal] = useState(false);

  // Substitute Modal state
  const [activeModalSubstitute, setActiveModalSubstitute] = useState<{
    leaveReqId: string;
    userId: string;
    userName: string;
    division: string;
  } | null>(null);
  const [substituteNameInput, setSubstituteNameInput] = useState('');

  // Message input state
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Accessible tickets for current user
  const accessibleTickets = useMemo(() => {
    return supportTickets.filter((ticket) => {
      if (isStaffOrHead) return true;
      return ticket.userId === currentUser?.id;
    });
  }, [supportTickets, isStaffOrHead, currentUser?.id]);

  // Filtered tickets by status and search
  const displayedTickets = useMemo(() => {
    return accessibleTickets.filter((ticket) => {
      const matchesFilter = filterTab === 'ALL' || ticket.status === filterTab;
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [accessibleTickets, filterTab, searchQuery]);

  // Set default selected ticket
  useEffect(() => {
    if (accessibleTickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(accessibleTickets[0].id);
    }
  }, [accessibleTickets, selectedTicketId]);

  const activeTicket = supportTickets.find((t) => t.id === selectedTicketId);

  // Messages in currently selected ticket
  const activeMessages = useMemo(() => {
    return chatMessages.filter((m) => {
      if (m.ticketId) {
        return m.ticketId === selectedTicketId;
      }
      if (activeTicket) {
        return m.senderId === activeTicket.userId || m.targetUserId === activeTicket.userId;
      }
      return false;
    });
  }, [chatMessages, selectedTicketId, activeTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, selectedTicketId]);

  // Smart FAQ matching function
  const findMatchingFaq = (text: string): FaqItem | null => {
    const clean = text.toLowerCase();
    let bestMatch: FaqItem | null = null;
    let maxHits = 0;

    for (const faq of KNOWLEDGE_FAQ_LIST) {
      let hits = 0;
      for (const kw of faq.keywords) {
        if (clean.includes(kw)) {
          hits++;
        }
      }
      if (hits > maxHits) {
        maxHits = hits;
        bestMatch = faq;
      }
    }

    return maxHits >= 1 ? bestMatch : null;
  };

  const triggerBotAnswer = (targetTicketId: string, answerText: string) => {
    setTimeout(() => {
      sendTicketMessage(
        targetTicketId,
        `🤖 [Bot Pintar SPPG]\n\n${answerText}`
      );
    }, 450);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    let currentTicketId = selectedTicketId;

    if (!currentTicketId) {
      // Auto-create ticket if none selected
      const res = createSupportTicket({
        title: userText.slice(0, 40) + '...',
        category: 'Umum',
        priority: 'SEDANG',
        initialMessage: userText,
      });
      if (res.ticket) {
        currentTicketId = res.ticket.id;
        setSelectedTicketId(res.ticket.id);
        setShowMobileChat(true);
      }
    } else {
      sendTicketMessage(currentTicketId, userText);
    }

    // Check if text matches FAQ topics or questions
    const matchedFaq = findMatchingFaq(userText);
    if (matchedFaq && currentTicketId) {
      triggerBotAnswer(currentTicketId, matchedFaq.answer);
    }
  };

  const handleSelectFaqQuestion = (faq: FaqItem) => {
    setShowFaqModal(false);
    let targetTicketId = selectedTicketId;

    if (!targetTicketId || activeTicket?.status === 'CLOSED') {
      const res = createSupportTicket({
        title: faq.shortLabel,
        category: faq.category,
        priority: 'SEDANG',
        initialMessage: faq.question,
      });
      if (res.ticket) {
        targetTicketId = res.ticket.id;
        setSelectedTicketId(res.ticket.id);
        setShowMobileChat(true);
      }
    } else {
      sendTicketMessage(targetTicketId, faq.question);
    }

    if (targetTicketId) {
      triggerBotAnswer(targetTicketId, faq.answer);
    }
  };

  const handleCreateNewTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketMessage.trim()) return;

    const res = createSupportTicket({
      title: newTicketTitle.trim() || `Tiket ${newTicketCategory}`,
      category: newTicketCategory,
      priority: newTicketPriority,
      initialMessage: newTicketMessage.trim(),
    });

    if (res.success && res.ticket) {
      const createdId = res.ticket.id;
      setSelectedTicketId(createdId);
      setShowMobileChat(true);
      setShowNewTicketModal(false);
      setNewTicketTitle('');
      setNewTicketMessage('');

      // Check if message matches any FAQ topic
      const matchedFaq = findMatchingFaq(newTicketMessage);
      if (matchedFaq) {
        triggerBotAnswer(createdId, matchedFaq.answer);
      }
    }
  };

  const handleClaimTicket = () => {
    if (!selectedTicketId) return;
    claimSupportTicket(selectedTicketId);
  };

  const handleCloseTicketConfirm = () => {
    if (!selectedTicketId) return;
    closeSupportTicket(selectedTicketId, closeNoteInput.trim() || 'Tiket telah diselesaikan.');
    setShowCloseTicketModal(false);
    setCloseNoteInput('');
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Terbuka
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
            Diproses
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
            Ditutup
          </span>
        );
    }
  };

  return (
    <div className="relative h-[calc(100vh-64px)] flex flex-col bg-[#f0f2f5] overflow-hidden select-none font-sans">
      {/* Top Main Bar: Instagram Direct Message Aesthetic */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all cursor-pointer active:scale-95"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Support & Livechat SPPG</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Tiket Bantuan Resmi & DM Layanan Operasional
            </p>
          </div>
        </div>

        {/* Action Buttons: FAQ Bot & Tiket Baru */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFaqModal(true)}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Bantuan FAQ & Bot</span>
            <span className="sm:hidden">FAQ</span>
          </button>

          <button
            onClick={() => setShowNewTicketModal(true)}
            className="px-3.5 py-1.5 bg-[#024b3a] hover:bg-[#023b2e] text-white rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mulai Chat / Tiket Baru</span>
            <span className="sm:hidden">Tiket Baru</span>
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Instagram Inbox (Daftar Tiket & Percakapan) */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Stories / Online Support Avatars */}
          <div className="p-3 border-b border-slate-100 overflow-x-auto flex items-center gap-3 scrollbar-none bg-slate-50/70">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-purple-600 font-black text-xs">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 truncate max-w-[54px]">
                Bot Pintar
              </span>
            </div>

            {users
              .filter((u) => ['Developer', 'Kepala SPPG', 'Staff'].includes(u.role))
              .map((admin) => (
                <div key={admin.id} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                    <img
                      src={
                        admin.facePhotoUrl ||
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
                      }
                      alt={admin.name}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 truncate max-w-[54px]">
                    {admin.name.split(' ')[0]}
                  </span>
                </div>
              ))}
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari percakapan / nomor tiket..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#024b3a]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 mt-2.5 overflow-x-auto scrollbar-none">
              {(
                [
                  { id: 'ALL', label: 'Semua' },
                  { id: 'OPEN', label: 'Terbuka' },
                  { id: 'IN_PROGRESS', label: 'Diproses' },
                  { id: 'CLOSED', label: 'Ditutup' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterTab === tab.id
                      ? 'bg-[#024b3a] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets & Chats List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {displayedTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-semibold">Tidak ada percakapan tiket</p>
                <button
                  onClick={() => setShowNewTicketModal(true)}
                  className="text-[11px] font-bold text-[#024b3a] underline cursor-pointer"
                >
                  Buat tiket bantuan baru
                </button>
              </div>
            ) : (
              displayedTickets.map((ticket) => {
                const isSelected = ticket.id === selectedTicketId;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setShowMobileChat(true);
                    }}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-r-4 border-[#024b3a]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-[#024b3a] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                        {ticket.userName.charAt(0).toUpperCase()}
                      </div>
                      {ticket.priority === 'URGENT' && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-ping" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {ticket.userName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            #{ticket.id}
                          </span>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>

                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {ticket.title}
                      </p>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {ticket.lastMessage || 'Belum ada pesan lanjutan'}
                      </p>

                      {ticket.claimedBy && (
                        <p className="text-[10px] text-emerald-700 font-semibold truncate mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>Klaim: {ticket.claimedBy.split(' ')[0]}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-1 pt-1 text-[10px] text-slate-400">
                        <span className="truncate">{ticket.category}</span>
                        <span>{ticket.updatedAt.split(',')[1] || ticket.updatedAt}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Instagram DM Chat View */}
        <div
          className={`flex-1 flex flex-col justify-between bg-white overflow-hidden ${
            !showMobileChat && isStaffOrHead ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeTicket ? (
            <>
              {/* Instagram-Style DM Header with Claim, Close & Reopen Controls */}
              <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs z-10 flex-wrap gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer mr-0.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#024b3a] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {activeTicket.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {activeTicket.userName}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 font-mono text-slate-600">
                        #{activeTicket.id}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {activeTicket.department} • {activeTicket.category}
                      {activeTicket.claimedBy && (
                        <span className="text-emerald-700 font-bold ml-1">
                          (Dikelola: {activeTicket.claimedBy})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Staff / Kepala SPPG / Developer Management Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {getStatusBadge(activeTicket.status)}

                  {isStaffOrHead && (
                    <>
                      {/* Claim Button */}
                      {activeTicket.status !== 'CLOSED' && (
                        <button
                          type="button"
                          onClick={handleClaimTicket}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs ${
                            activeTicket.claimedBy === currentUser?.name
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          title="Klaim penanganan tiket ini untuk Anda"
                        >
                          <Briefcase className="w-3 h-3" />
                          <span>
                            {activeTicket.claimedBy === currentUser?.name
                              ? 'Anda Mengklaim'
                              : activeTicket.claimedBy
                              ? 'Alihkan Klaim'
                              : 'Klaim Tiket'}
                          </span>
                        </button>
                      )}

                      {/* Close Ticket Button */}
                      {activeTicket.status !== 'CLOSED' && (
                        <button
                          type="button"
                          onClick={() => setShowCloseTicketModal(true)}
                          className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                          title="Tutup tiket setelah masalah selesai"
                        >
                          <Lock className="w-3 h-3 text-rose-600" />
                          <span>Tutup Tiket</span>
                        </button>
                      )}

                      {/* Reopen Ticket Button */}
                      {activeTicket.status === 'CLOSED' && (
                        <button
                          type="button"
                          onClick={() => updateTicketStatus(activeTicket.id, 'OPEN')}
                          className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Buka kembali tiket jika ada keluhan lanjutan"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Buka Kembali</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Ticket Information Strip */}
              <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-2 truncate">
                  <Tag className="w-3.5 h-3.5 text-[#024b3a] shrink-0" />
                  <span className="font-bold text-slate-800 truncate">
                    {activeTicket.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400">Prioritas:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      activeTicket.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-800'
                        : activeTicket.priority === 'TINGGI'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {activeTicket.priority}
                  </span>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-radial from-white to-slate-50/50">
                <div className="text-center my-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full border border-slate-200/60 shadow-2xs">
                    Percakapan tiket bantuan resmi SPPG • Dilengkapi Asisten Bot & Pengelola
                  </span>
                </div>

                {activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  const isSystem = msg.isSystemNote;
                  const isBot = msg.text.includes('[Bot Pintar SPPG]');

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-3 animate-in fade-in">
                        <div className="inline-block px-4 py-2 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] font-medium text-slate-700 shadow-2xs max-w-md">
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span className="block text-[9px] text-slate-400 mt-1 font-mono">
                            {msg.timeStr}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender Name & Role Label */}
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          {isBot && <Bot className="w-3.5 h-3.5 text-purple-600" />}
                          {msg.senderName}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200 font-bold text-slate-700">
                          {isBot ? 'Asisten AI' : msg.senderRole}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {msg.timeStr}
                        </span>
                      </div>

                      {/* Instagram DM Pill Bubble */}
                      <div className="relative flex items-center">
                        <div
                          className={`max-w-[88%] sm:max-w-[72%] p-3.5 text-xs font-medium shadow-xs relative transition-all ${
                            isMe
                              ? 'bg-gradient-to-tr from-[#024b3a] to-[#046c54] text-white rounded-2xl rounded-br-xs'
                              : isBot
                              ? 'bg-purple-50 border border-purple-200 text-purple-950 rounded-2xl rounded-bl-xs'
                              : msg.isLeaveRequest
                              ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl rounded-bl-xs'
                              : 'bg-[#f0f2f5] text-slate-800 border border-slate-200/60 rounded-2xl rounded-bl-xs'
                          }`}
                        >
                          {msg.isLeaveRequest && (
                            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-rose-200 font-extrabold text-rose-700">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>PENGAJUAN IZIN / SAKIT (1 Hari)</span>
                            </div>
                          )}
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>

                        {/* Heart reaction button */}
                        <button
                          type="button"
                          onClick={() => toggleMessageLike(msg.id)}
                          className={`ml-1.5 mr-1.5 p-1 rounded-full transition-all cursor-pointer opacity-80 hover:opacity-100 ${
                            msg.liked ? 'text-rose-500 scale-110' : 'text-slate-300 hover:text-rose-400'
                          }`}
                          title="Sukai pesan"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${msg.liked ? 'fill-rose-500' : ''}`}
                          />
                        </button>
                      </div>

                      {/* Tunjuk Anggota Pengganti for Leave Requests */}
                      {msg.isLeaveRequest && isStaffOrHead && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            onClick={() =>
                              setActiveModalSubstitute({
                                leaveReqId: msg.id,
                                userId: msg.senderId,
                                userName: msg.senderName,
                                division: msg.division,
                              })
                            }
                            className="px-3 py-1 rounded-xl bg-amber-500 text-white font-bold text-[10px] shadow-2xs hover:bg-amber-600 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="w-3 h-3" />
                            <span>Tunjuk Anggota Pengganti Dapur</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick FAQ Question Pills (Click to ask & get auto-bot answer) */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Bot className="w-3 h-3 text-purple-600" />
                  FAQ Bot:
                </span>
                {KNOWLEDGE_FAQ_LIST.slice(0, 5).map((faq) => (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => handleSelectFaqQuestion(faq)}
                    className="px-3 py-1 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 hover:border-purple-300 text-[10px] font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
                  >
                    {faq.shortLabel}
                  </button>
                ))}
              </div>

              {/* Instagram-Style Input Footer */}
              <div className="bg-white p-3 border-t border-slate-200 shadow-lg">
                {activeTicket.status === 'CLOSED' ? (
                  <div className="p-3 bg-slate-100 rounded-2xl text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Tiket ini telah diselesaikan dan ditutup.</span>
                    <button
                      type="button"
                      onClick={() => setShowNewTicketModal(true)}
                      className="font-bold text-[#024b3a] underline ml-1 cursor-pointer"
                    >
                      Buka Tiket Baru
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-[#f0f2f5] rounded-full px-4 py-2 border border-slate-200/60 focus-within:border-[#024b3a] focus-within:bg-white transition-all">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Tanyakan apa saja atau balas ${
                          isStaffOrHead ? activeTicket.userName : 'Support SPPG'
                        }...`}
                        className="flex-1 bg-transparent text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
                      />

                      <button
                        type="button"
                        onClick={() => setShowFaqModal(true)}
                        className="text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                        title="Buka Pusat FAQ & Asisten Bot"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setInputText((prev) => prev + ' 👍')}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="Emoji"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0 ${
                        inputText.trim()
                          ? 'bg-[#024b3a] text-white hover:bg-[#023b2e] active:scale-95'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Pilih Percakapan Tiket</h3>
              <p className="text-xs max-w-sm">
                Pilih salah satu tiket dari daftar di sebelah kiri atau buat tiket bantuan baru untuk memulai percakapan.
              </p>
              <button
                onClick={() => setShowNewTicketModal(true)}
                className="px-4 py-2 bg-[#024b3a] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#023b2e] cursor-pointer"
              >
                + Mulai Tiket Baru
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Bantuan Pertanyaan FAQ & Bot Pintar */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Pusat Bantuan FAQ & Bot Pintar SPPG
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pilih pertanyaan untuk mendapatkan jawaban instan dari Bot
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFaqModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {KNOWLEDGE_FAQ_LIST.map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => handleSelectFaqQuestion(faq)}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {faq.category}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Tanyakan ke Bot →
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-900">
                    {faq.question}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {faq.answer.replace(/\n/g, ' ')}
                  </p>
                </button>
              ))}
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400">
              Bot juga otomatis menjawab jika Anda mengetik pertanyaan serupa di ruang obrolan.
            </div>
          </div>
        </div>
      )}

      {/* Modal: Buat Tiket Baru */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#024b3a] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Buka Tiket Bantuan Baru</h3>
                  <p className="text-[11px] text-slate-400">
                    Otomatis terhubung dengan Staff, Kepala SPPG, dan Bot
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTicketSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Kendala / Pertanyaan:
                </label>
                <select
                  value={newTicketCategory}
                  onChange={(e) => setNewTicketCategory(e.target.value as TicketCategory)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
                >
                  {TICKET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subjek / Judul Singkat:
                </label>
                <input
                  type="text"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  placeholder="Contoh: Kendala GPS di Dapur Pemorsian"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tingkat Prioritas:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['RENDAH', 'SEDANG', 'TINGGI', 'URGENT'] as TicketPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTicketPriority(p)}
                      className={`py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                        newTicketPriority === p
                          ? p === 'URGENT'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-[#024b3a] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pesan Pembuka / Detail Masalah:
                </label>
                <textarea
                  rows={3}
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  placeholder="Jelaskan kendala Anda. Bot cerdas & Staff akan segera menjawab..."
                  required
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#024b3a] text-white text-xs font-bold shadow-md hover:bg-[#023b2e] cursor-pointer"
                >
                  Kirim & Buat Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tutup Tiket (Staff / Kepala SPPG / Developer) */}
      {showCloseTicketModal && activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Konfirmasi Tutup Tiket</h3>
                  <p className="text-[11px] text-slate-400">
                    Tiket #{activeTicket.id} - {activeTicket.userName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCloseTicketModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Apakah kendala anggota telah tuntas ditangani? Menutup tiket akan mengunci percakapan dan mengirimkan ringkasan penyelesaian.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Penyelesaian:
                </label>
                <textarea
                  rows={3}
                  value={closeNoteInput}
                  onChange={(e) => setCloseNoteInput(e.target.value)}
                  placeholder="Contoh: Kendala GPS telah diselesaikan dan staf telah berhasil absensi."
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseTicketModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCloseTicketConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 cursor-pointer"
              >
                Selesaikan & Tutup Tiket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tunjuk Anggota Pengganti (Substitute Assignment) */}
      {activeModalSubstitute && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Tunjuk Anggota Pengganti</h3>
                  <p className="text-[11px] text-slate-500">
                    Menggantikan: <span className="font-bold text-slate-700">{activeModalSubstitute.userName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalSubstitute(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Nama Anggota Pengganti untuk Divisi {activeModalSubstitute.division}:
              </label>
              <input
                type="text"
                value={substituteNameInput}
                onChange={(e) => setSubstituteNameInput(e.target.value)}
                placeholder="Masukkan nama lengkap atau pilih dari daftar..."
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
              />
              {settings.savedSubstitutes && settings.savedSubstitutes.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1.5">
                    Pilih dari Daftar Pengganti Tersimpan:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {settings.savedSubstitutes.map((name, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSubstituteNameInput(name)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          substituteNameInput === name
                            ? 'bg-[#024b3a] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalSubstitute(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!substituteNameInput.trim()) return;
                  const todayStr = new Date().toISOString().split('T')[0];
                  assignSubstitute(
                    activeModalSubstitute.userId,
                    substituteNameInput,
                    todayStr
                  );
                  setActiveModalSubstitute(null);
                  setSubstituteNameInput('');
                }}
                className="px-5 py-2 rounded-xl bg-[#024b3a] text-white text-xs font-bold shadow-md hover:bg-[#023b2d] cursor-pointer"
              >
                Tugaskan Pengganti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
