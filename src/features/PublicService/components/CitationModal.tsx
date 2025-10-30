import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Citation } from '../utils/types';

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  const [isShowing, setIsShowing] = useState<boolean>(false);

  useEffect(() => {
    if (citation) {
      const timer = setTimeout(() => setIsShowing(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsShowing(false);
    }
  }, [citation]);

  if (!citation) return null;

  return (
    // --- START: MODIFIED CODE ---
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4 transition-opacity duration-300"
      style={{ opacity: isShowing ? 1 : 0 }}
    >
    {/* --- END: MODIFIED CODE --- */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 truncate" title={citation.documentName}>
            {citation.documentName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none rounded-full p-1 hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {citation.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CitationModal;