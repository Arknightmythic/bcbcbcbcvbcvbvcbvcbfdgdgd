// [File: src/features/HistoryValidation/components/HistoryValidationRow.tsx]

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { ActionType, ValidationHistoryItem } from '../utils/types';
import { Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface HistoryValidationTableRowProps {
  history: ValidationHistoryItem;
  onAction: (action: ActionType, history: ValidationHistoryItem) => void;
  onViewText: (title: string, content: string) => void; 
}

// --- Komponen Helper TruncatedText yang Diperbarui ---
const TruncatedText: React.FC<{ content: string; title: string; onIconClick: () => void }> = ({ content, title, onIconClick }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const checkTruncation = () => {
    const el = textRef.current;
    if (el) {
      // Periksa apakah tinggi total konten (scrollHeight) 
      // lebih besar dari tinggi yang terlihat (clientHeight)
      const isOverflowing = el.scrollHeight > el.clientHeight;
      
      setIsTruncated(prev => {
        if (prev !== isOverflowing) {
          return isOverflowing;
        }
        return prev;
      });
    }
  };

  useLayoutEffect(() => {
    checkTruncation();
  }, [content]);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>; 
    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        checkTruncation();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(debounceTimer);
    };
  }, []); // Dependensi kosong agar listener hanya dipasang sekali

  return (
    // 1. Container tetap 'relative'
    <div className="relative">
      <p 
        ref={textRef}
        // 2. Tambahkan padding-right (pr-6) HANYA JIKA terpotong.
        //    Ini akan "mendorong" teks (dan elipsis) ke kiri,
        //    membuat ruang untuk ikon.
        className={`
          text-sm leading-tight text-gray-700 whitespace-pre-wrap line-clamp-3
          ${isTruncated ? 'pr-6' : ''} 
        `}
        title={isTruncated ? `Klik ikon untuk melihat ${title} selengkapnya` : undefined}
      >
        {content}
      </p>
      
      {/* 3. Tampilkan tombol HANYA JIKA isTruncated bernilai true */}
      {isTruncated && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIconClick();
          }}
          // 4. Posisikan ikon di dalam area padding yang baru saja kita buat.
          //    'bg-white' telah dihapus.
          className="absolute bottom-0 right-0 p-0.5 text-blue-600 hover:bg-blue-50"
          title={`Lihat ${title} Lengkap`}
        >
          <FileText className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
// --- Akhir Komponen Helper ---


const HistoryValidationTableRow: React.FC<HistoryValidationTableRowProps> = ({ history, onAction, onViewText }) => {
  return (
    <tr className="hover:bg-gray-50 text-sm text-gray-700">
      <td className="px-4 py-3 text-center">{new Date(history.tanggal).toLocaleDateString("en-GB")}</td>
      <td className="px-4 py-3">{history.user}</td>
      <td className="px-4 py-3">{history.session_id}</td>

      <td className="px-4 py-3 max-w-xs">
        <TruncatedText
          content={history.pertanyaan}
          title="Pertanyaan"
          onIconClick={() => onViewText('Pertanyaan', history.pertanyaan)}
        />
      </td>
      <td className="px-4 py-3 max-w-xs">
        <TruncatedText
          content={history.jawaban_ai}
          title="Jawaban AI"
          onIconClick={() => onViewText('Jawaban AI', history.jawaban_ai)}
        />
      </td>

      <td className="px-4 py-3 text-center">
        {history.tidak_terjawab ? (
            <span className="text-red-600 font-semibold">Ya</span>
        ) : (
            <span className="text-gray-500">Tidak</span>
        )}
      </td>

      <td className="px-4 py-3 capitalize text-center">
        <StatusBadge status={history.status_validasi} />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-x-2">
          <button
            onClick={() => onAction('approve', history)}
            className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Validate"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => onAction('reject', history)}
            className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Not Validate"
          >
            <XCircle className="w-5 h-5" />
          </button>
          
        </div>
      </td>
    </tr>
  );
};

export default HistoryValidationTableRow;