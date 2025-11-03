import React from 'react';
import { X, FileText, Eye } from 'lucide-react';
import type { DocumentVersion } from '../types/types';

interface VersioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: DocumentVersion[];
  documentTitle: string;
  onViewVersion: (version: DocumentVersion) => void;
}

const VersioningModal: React.FC<VersioningModalProps> = ({ isOpen, onClose, versions, documentTitle, onViewVersion }) => {
  if (!isOpen) return null;

  // Sort versions by ID in descending order (latest first)
  const sortedVersions = [...versions].sort((a, b) => b.id - a.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 m-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Version history for "{documentTitle}"</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
        </div>

        <div className="mt-6 max-h-[70vh] overflow-y-auto">
          {sortedVersions.length > 0 ? (
            <div className="w-full text-sm text-left text-gray-500">
              <div className="grid grid-cols-[1fr_4fr_2fr_2fr_1fr] gap-4 px-4 py-3 bg-gray-100 font-semibold text-gray-700 uppercase rounded-t-lg">
                <div>Version</div>
                <div>File Name</div>
                <div>Modified by</div>
                <div>Date</div>
                <div className="text-right">Action</div>
              </div>
              <div className="divide-y divide-gray-200">
                {sortedVersions.map((version, index) => (
                  <div key={version.id} className="grid grid-cols-[1fr_4fr_2fr_2fr_1fr] gap-4 items-center px-4 py-3 hover:bg-gray-50">
                    {/* Column 1: Version */}
                    <div className="text-gray-900 font-medium">v{sortedVersions.length - index}</div>
                    
                    {/* Column 2: File Name */}
                    <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                       <span className="truncate" title={version.document_name}>
                         {version.document_name}
                       </span>
                    </div>

                    {/* Column 3: Modified by */}
                    <div className="text-gray-700">{version.staff}</div>

                    {/* Column 4: Date */}
                    <div className="text-gray-700">{new Date(version.created_at).toLocaleDateString("id-ID")}</div>

                    {/* Column 5: Action */}
                    <div className="flex justify-end">
                      <button 
                        onClick={() => onViewVersion(version)} // <-- 4. UBAH DARI <a> KE <button>
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

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );
};

export default VersioningModal;