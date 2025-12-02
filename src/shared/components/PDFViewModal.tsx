import React, { useState, useEffect } from 'react';
import { X, Loader2, ExternalLink } from 'lucide-react';
import type { PdfViewModalProps } from '../types/types';

const PdfViewModal: React.FC<PdfViewModalProps> = ({ isOpen, onClose, url, isLoading, title }) => {
  // State untuk deteksi Mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // State khusus Mobile (Blob)
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  // 1. Deteksi Ukuran Layar
  useEffect(() => {
    const checkMobile = () => {
      // Anggap mobile jika lebar layar < 768px (ukuran tablet/HP standar)
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile(); // Cek saat mount
    window.addEventListener('resize', checkMobile); // Cek saat resize
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 2. Logic Khusus Mobile: Fetch & Blob
  useEffect(() => {
    // Jalankan hanya jika: Modal Buka + Ada URL + Mode Mobile
    if (!isOpen || !url || !isMobile) return;

    let active = true; // Flag untuk mencegah race condition

    const fetchPdfBlob = async () => {
      setIsDownloading(true);
      setDownloadError(false);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengunduh file");
        
        const blob = await response.blob();
        if (active) {
          const objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }
      } catch (error) {
        console.error("Mobile blob fetch error:", error);
        if (active) setDownloadError(true);
      } finally {
        if (active) setIsDownloading(false);
      }
    };

    fetchPdfBlob();

    return () => {
      active = false;
      // Cleanup blob url saat unmount atau url berubah
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url, isOpen, isMobile]); // Dependency isMobile penting di sini

  // Reset state saat tutup
  useEffect(() => {
    if (!isOpen) {
      setBlobUrl(null);
      setDownloadError(false);
      setIsDownloading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- RENDER CONTENT ---
  const renderContent = () => {
    // ---------------------------------------------------------
    // KASUS 1: DESKTOP (Web)
    // Gunakan logika asli (Iframe langsung ke URL API)
    // ---------------------------------------------------------
    if (!isMobile) {
      return (
        <div className="flex-1 mt-4 rounded-lg overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Sedang membuka...</span>
            </div>
          )}

          {!isLoading && url && (
            <iframe
              src={url}
              title="Document Viewer"
              className="w-full h-full border-0"
              allow="fullscreen"
            />
          )}

          {!isLoading && !url && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <p className="text-red-500">File tidak bisa dibuka!</p>
             </div>
          )}
        </div>
      );
    }

    // ---------------------------------------------------------
    // KASUS 2: MOBILE (HP)
    // Gunakan Blob URL agar token expired tidak masalah
    // ---------------------------------------------------------
    const isBusyMobile = isLoading || isDownloading;

    return (
      <div className="flex-1 mt-4 rounded-lg overflow-hidden relative bg-gray-100 flex flex-col">
         {isBusyMobile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="mt-3 text-gray-600 text-sm">Menyiapkan dokumen...</span>
            </div>
         ) : downloadError ? (
            <div className="flex items-center justify-center h-full text-red-500 text-center p-4">
               <p>Gagal memuat dokumen.</p>
            </div>
         ) : blobUrl ? (
            <>
               {/* Tetap coba render iframe pake blob (kadang support di Android Chrome) */}
               <iframe
                 src={blobUrl}
                 title="Mobile Document Viewer"
                 className="w-full h-full border-0"
               />
               
               {/* Tombol Overlay "Buka di Browser" 
                   Sangat penting untuk iOS/Mobile yang sering nge-blok iframe PDF */}
               <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
                  <a 
                    href={blobUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pointer-events-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Buka File
                  </a>
               </div>
            </>
         ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
               Tidak ada dokumen.
            </div>
         )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4" 
      onClick={onClose}
    >
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

        {/* Content Dinamis (Desktop vs Mobile) */}
        {renderContent()}
      </div>
    </div>
  );
};

export default PdfViewModal;