import React, { useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import type { ValidationHistoryItem } from '../../features/HistoryValidation/utils/types';


interface ApproveWithCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ValidationHistoryItem | null;
  onConfirm: (history: ValidationHistoryItem, correction: string) => void;
  isConfirming: boolean;
}

const ApproveWithCorrectionModal: React.FC<ApproveWithCorrectionModalProps> = ({
  isOpen,
  onClose,
  history,
  onConfirm,
  isConfirming,
}) => {
  const [correctionText, setCorrectionText] = useState('');
  if (!isOpen || !history) {
    return null;
  }
  const handleConfirm = () => {
    onConfirm(history, correctionText);
  };
  
  const handleClose = () => {
      setCorrectionText('');
      onClose();
  }

  // Teks tombol konfirmasi disesuaikan berdasarkan ada/tidaknya koreksi
  const confirmText = correctionText.trim() === '' 
    ? "Ya, Setuju (Tanpa Koreksi)" 
    : "Ya, Setuju (Dengan Koreksi)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm" onClick={handleClose}>
      <div className="relative w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Konfirmasi Validasi (Approve)
          </h3>
          <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" onClick={handleClose}>
            <X className="w-5 h-5" />
            <span className="sr-only">Tutup modal</span>
          </button>
        </div>
        
        <div className="py-5">
          <p className="text-base leading-relaxed text-gray-700 font-medium mb-4">
            Anda akan menyetujui Jawaban AI untuk pertanyaan berikut. Harap periksa kembali.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 max-h-36 overflow-y-auto">
            <p className="text-xs text-gray-500 font-medium">Pertanyaan:</p>
            <p className="text-sm text-gray-900">{history.pertanyaan}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 max-h-36 overflow-y-auto">
            <p className="text-xs text-gray-500 font-medium">Jawaban AI:</p>
            <p className="text-sm text-gray-900">{history.jawaban_ai}</p>
          </div>

          <label htmlFor="correction" className="block text-sm font-medium text-gray-700 mb-2">
            Koreksi Jawaban yang Lebih Tepat (Opsional):
          </label>
          <textarea
            id="correction"
            rows={4}
            className="block w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2.5"
            placeholder="Masukkan koreksi jika jawaban AI perlu diperbaiki. Jika tidak, biarkan kosong."
            value={correctionText}
            onChange={(e) => setCorrectionText(e.target.value)}
            disabled={isConfirming}
          />
        </div>
        
        <div className="flex items-center justify-end pt-4 space-x-3 border-t border-gray-200">
          <button 
            onClick={handleClose} 
            type="button" 
            className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100" 
            disabled={isConfirming}
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            type="button"
            disabled={isConfirming}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg focus:ring-4 focus:outline-none flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-400`}
          >
            {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isConfirming ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveWithCorrectionModal;