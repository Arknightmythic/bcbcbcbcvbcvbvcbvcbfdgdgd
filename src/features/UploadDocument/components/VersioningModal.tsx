import React from 'react';
import { X, FileText, Eye } from 'lucide-react';
import type { DocumentVersion } from '../types/types';
import Tooltip from '../../../shared/components/Tooltip'; // <-- 1. Impor Tooltip

interface VersioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: DocumentVersion[];
  documentTitle: string;
  onViewVersion: (version: DocumentVersion) => void;
}

const VersioningModal: React.FC<VersioningModalProps> = ({ isOpen, onClose, versions, documentTitle, onViewVersion }) => {
  if (!isOpen) return null;

  
  const sortedVersions = [...versions].sort((a, b) => b.id - a.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-4 md:p-6 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-md font-bold text-gray-800">Version history for "{documentTitle}"</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
        </div>

        {/* --- PERUBAHAN DI SINI: Tambahkan overflow-x-auto dan scrollbar kustom --- */}
        <div className="mt-4 overflow-y-auto overflow-x-auto custom-scrollbar-overlay">
          {sortedVersions.length > 0 ? (
            /* --- PERUBAHAN DI SINI: Tambahkan min-w untuk memicu scroll --- */
            <div className="w-full text-sm text-left text-gray-500 min-w-[768px]">
              {/* --- PERUBAHAN DI SINI: Buat header sticky --- */}
              <div className="grid grid-cols-[1fr_4fr_2fr_2fr_1fr] gap-4 px-4 py-3 bg-gray-100 font-semibold text-gray-700 uppercase rounded-t-lg sticky top-0 z-10">
                <div>Version</div>
                <div>File Name</div>
                <div>Modified by</div>
                <div>Date</div>
                {/* --- PERUBAHAN DI SINI: Buat header Action sticky --- */}
                <div className="text-right sticky right-0 bg-gray-100">Action</div>
              </div>
              <div className="divide-y divide-gray-200">
                {sortedVersions.map((version, index) => (
                  /* --- PERUBAHAN DI SINI: Tambahkan 'group' --- */
                  <div key={version.id} className="group grid grid-cols-[1fr_4fr_2fr_2fr_1fr] gap-4 items-center px-4 py-3 hover:bg-gray-50">
                    {/* Column 1: Version */}
                    <div className="text-gray-900 font-medium">v{sortedVersions.length - index}</div>
                    
                    {/* Column 2: File Name (dengan Tooltip) */}
                    <div className="flex items-center gap-2 overflow-hidden"> {/* Tambah overflow-hidden untuk truncate */}
                       <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                       {/* --- PERUBAHAN DI SINI: Ganti 'title' dengan komponen <Tooltip> --- */}
                       <Tooltip text={version.document_name}>
                         <span className="truncate">
                           {version.document_name}
                         </span>
                       </Tooltip>
                    </div>

                    {/* Column 3: Modified by */}
                    <div className="text-gray-700 truncate">{version.staff}</div>

                    {/* Column 4: Date */}
                    <div className="text-gray-700">{new Date(version.created_at).toLocaleDateString("id-ID")}</div>

                    {/* Column 5: Action (Sticky) */}
                    {/* --- PERUBAHAN DI SINI: Buat sel Action sticky --- */}
                    <div className="flex justify-end sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200 pl-4">
                      <button 
                        onClick={() => onViewVersion(version)} 
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title={`View Version ${sortedVersions.length - index}`}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No previous versions found for this document.</p>
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );
};

export default VersioningModal;