import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface PdfViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;      
  isLoading: boolean;  
  title: string;
}

const PdfViewModal: React.FC<PdfViewModalProps> = ({ isOpen, onClose, url, isLoading, title }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4" 
      onClick={onClose}
    >
      {/* --- PERUBAHAN DI SINI: hapus m-4, ubah p-6 -> p-4 md:p-6, tambah max-h --- */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] h-[90vh] p-4 md:p-6 flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-md font-bold text-gray-800 truncate" title={title}>
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Konten Modal (Spinner atau Iframe) */}
        <div className="flex-1 mt-4 rounded-lg overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Generating secure URL...</span>
            </div>
          )}

          {(!isLoading && url) && (
            <iframe
              src={url}
              title="Document Viewer"
              className="w-full h-full border-0"
              allow="fullscreen"
            ></iframe>
          )}

          {(!isLoading && !url) && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <p className="text-red-500">Could not load document.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewModal;