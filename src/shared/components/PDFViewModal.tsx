import React, { useState, useEffect } from 'react';
import { X, Loader2, ExternalLink } from 'lucide-react';
import type { PdfViewModalProps } from '../types/types';

const PdfViewModal: React.FC<PdfViewModalProps> = ({ isOpen, onClose, url, isLoading, title }) => {
  
  const [isMobile, setIsMobile] = useState(false);
  
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    const checkMobile = () => { 
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile(); 
    window.addEventListener('resize', checkMobile); 
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  useEffect(() => {
    
    if (!isOpen || !url || !isMobile) return;

    let active = true; 

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
      
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url, isOpen, isMobile]); 

  
  useEffect(() => {
    if (!isOpen) {
      setBlobUrl(null);
      setDownloadError(false);
      setIsDownloading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  
  const renderContent = () => {
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
              title="Pratinjau Dokumen"
              className="w-full h-full border-0"
              allow="fullscreen"
            />
          )}

          {!isLoading && !url && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <p className="text-red-500">File tidak dapat dibuka!</p>
             </div>
          )}
        </div>
      );
    }

    const isBusyMobile = isLoading || isDownloading;

    const renderMobileInnerContent = () => {
      if (isBusyMobile) {
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="mt-3 text-gray-600 text-sm">Menyiapkan dokumen...</span>
          </div>
        );
      }

      if (downloadError) {
        return (
          <div className="flex items-center justify-center h-full text-red-500 text-center p-4">
             <p>Gagal memuat dokumen.</p>
          </div>
        );
      }

      if (blobUrl) {
        return (
          <>
             <iframe
               src={blobUrl}
               title="Mobile Pratinjau Dokumen"
               className="w-full h-full border-0"
             />
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
        );
      }
      
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
           Tidak ada dokumen.
        </div>
      );
    };

    return (
      <div className="flex-1 mt-4 rounded-lg overflow-hidden relative bg-gray-100 flex flex-col">
         {renderMobileInnerContent()}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop tetap menggunakan button untuk aksesibilitas dan menghindari onClick pada div */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-white/30 backdrop-blur-sm border-none cursor-default"
        onClick={onClose}
        aria-label="Close modal backdrop"
        tabIndex={-1}
      />

      {/* PERBAIKAN: Mengganti <div> dengan <dialog> */}
      <dialog
        open
        aria-modal="true"
        aria-labelledby="modal-title"
        // Menambahkan border-none dan m-0 untuk mereset gaya default browser pada elemen dialog
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] h-[90vh] p-4 md:p-6 flex flex-col z-10 border-none m-0"
      >
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 id="modal-title" className="text-md font-bold text-gray-800 truncate" title={title}>
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {renderContent()}
      </dialog>
    </div>
  );
};

export default PdfViewModal;