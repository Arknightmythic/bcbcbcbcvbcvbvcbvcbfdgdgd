// src/features/HistoryValidation/components/DownloadPopup.tsx

import React, { useState, useRef } from 'react';
import { Download, X } from 'lucide-react';
import { useClickOutside } from '../../../shared/hooks/useClickOutside';

interface DownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (startDate: string, endDate: string, type: string) => void;
  isDownloading?: boolean;
}

const DownloadPopup: React.FC<DownloadPopupProps> = ({
  isOpen,
  onClose,
  onDownload,
  isDownloading = false
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('all');
  const [error, setError] = useState('');

  const popupRef = useClickOutside<HTMLDivElement>(() => {
    if (!isDownloading) {
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validasi tanggal
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return;
    }

    onDownload(startDate, endDate, type);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setType('all');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/20">
      <div
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in-down"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Download Chat History
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isDownloading}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isDownloading}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Pesan
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isDownloading}
            >
              <option value="all">Semua</option>
              <option value="human">Human</option>
              <option value="ai">AI</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isDownloading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isDownloading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500">
            * Kosongkan tanggal untuk mendownload semua data
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DownloadPopup;