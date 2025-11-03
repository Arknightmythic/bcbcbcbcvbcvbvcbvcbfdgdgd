// [File: src/shared/components/TextExpandModal.tsx]

import React from 'react';
import { X } from 'lucide-react';

interface TextExpandModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const TextExpandModal: React.FC<TextExpandModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm p-4" // Latar belakang blur
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up" // Animasi
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow text-gray-700">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
        <div className="p-4 border-t border-gray-200 text-right bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextExpandModal;