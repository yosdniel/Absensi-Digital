import React from 'react';

interface PhotoProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  subtitle?: string;
}

export const PhotoProofModal: React.FC<PhotoProofModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = "Bukti Foto Absen Sakit",
  subtitle = "Kamis, 16 April 2026 - 13:02",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo Container */}
        <div className="w-full h-80 bg-slate-900 relative overflow-hidden flex items-center justify-center">
          <img
            src={imageUrl || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"}
            alt="Bukti Foto"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details & Action */}
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            {subtitle}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-semibold text-teal-800 hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
