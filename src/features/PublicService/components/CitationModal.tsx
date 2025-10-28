import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react'; // Menggunakan ikon dari lucide-react
import type { Citation } from '../utils/types'; // Import tipe Citation

// Definisikan props untuk komponen CitationModal
interface CitationModalProps {
  citation: Citation | null; // Bisa null jika tidak ada sitasi terpilih
  onClose: () => void; // Fungsi untuk menutup modal
}

const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  const [isShowing, setIsShowing] = useState<boolean>(false);

  // Efek untuk animasi fade-in saat modal muncul
  useEffect(() => {
    if (citation) {
      // Timeout kecil untuk memastikan elemen sudah di-render sebelum transisi dimulai
      const timer = setTimeout(() => setIsShowing(true), 10);
      return () => clearTimeout(timer);
    } else {
      // Reset state saat modal ditutup
      setIsShowing(false);
    }
  }, [citation]); // Bergantung pada props citation

  // Jangan render apapun jika tidak ada citation
  if (!citation) return null;

  return (
    // Latar belakang overlay modal
    <div
      onClick={onClose} // Menutup modal saat overlay diklik
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300"
      style={{ opacity: isShowing ? 1 : 0 }} // Kontrol opacity untuk fade effect
    >
      {/* Kontainer Modal */}
      <div
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat diklik di dalam konten modal
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} // Efek scale dan opacity
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 truncate" title={citation.documentName}>
            {citation.documentName} {/* Menampilkan nama dokumen */}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none rounded-full p-1 hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" /> {/* Ikon close */}
          </button>
        </div>

        {/* Konten Modal */}
        <div className="p-6 max-h-[60vh] overflow-y-auto"> {/* Batas tinggi dan scroll */}
          <p className="text-sm text-gray-700 whitespace-pre-wrap"> {/* Menjaga format spasi dan baris baru */}
            {citation.content} {/* Menampilkan konten sitasi */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CitationModal;
