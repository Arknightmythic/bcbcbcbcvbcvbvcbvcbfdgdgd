// [UPDATE: src/features/KnowledgeBase/components/DocumentRow.tsx]

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  UploadIcon,
  XCircle,
  MoreVertical,
  Activity,
} from "lucide-react";
import type { UploadedDocument } from "../types/types";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";

interface DocumentRowProps {
  document: UploadedDocument;
  isSelected: boolean;
  onSelect: (event: React.ChangeEvent<HTMLInputElement>, docId: number) => void;
  onDelete: (doc: UploadedDocument) => void; 
  onNewVersion: (doc: UploadedDocument) => void;
  onViewVersions: (doc: UploadedDocument) => void;
  onViewFile: (doc: UploadedDocument) => void;
}

const DocumentRow: React.FC<DocumentRowProps> = ({
  document: doc,
  isSelected,
  onSelect,
  onDelete,
  onNewVersion,
  onViewVersions,
  onViewFile,
}) => {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsDropdownOpen(false);
  });
  
  // --- DEFINISI STATUS ---
  const isPending = doc.status === "Pending";
  const isRejected = doc.status === "Rejected";
  const isIngestFailed = doc.ingest_status === "failed";
  const isProcessing = doc.ingest_status === "processing"; // [BARU]

  // Logic Action Disabled (View, Versioning, Info)
  // Ditambah isProcessing agar tombol-tombol ini mati saat sedang diproses
  const isActionDisabled = isPending || isRejected || isIngestFailed || isProcessing;

  // Logic Delete Disabled
  // Hapus HANYA mati jika sedang Processing. (Failed/Rejected/Pending boleh dihapus)
  const isDeleteDisabled = isProcessing;

  const getApprovalStatusComponent = () => {
    if (doc.status === "Approved") {
      return (
        <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircle2 className="w-2 h-2 mr-1" /> Disetujui
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-red-100 text-red-800">
          <AlertCircle className="w-2 h-2 mr-1" /> Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-yellow-100 text-yellow-800">
        <Clock className="w-2 h-2 mr-1" /> Menunggu
      </span>
    );
  };

  const getIngestStatusComponent = () => {
    const status = doc.ingest_status;

    if (status === "finished") {
      return (
        <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800">
          <CheckCircle2 className="w-2 h-2 mr-1" /> Selesai
        </span>
      );
    }
    if (status === "processing") {
      return (
        <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-800 animate-pulse">
          <Activity className="w-2 h-2 mr-1 animate-spin" /> Memproses
        </span>
      );
    }
    if (status === "failed") {
      return (
        <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-red-100 text-red-800">
          <XCircle className="w-2 h-2 mr-1" /> Gagal
        </span>
      );
    }
    if (status === "unprocessed") {
        return (
          <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-gray-200 text-gray-600">
            <XCircle className="w-2 h-2 mr-1" /> Tidak Diproses
          </span>
        );
      }
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-500">
        <Clock className="w-2 h-2 mr-1" /> Menunggu
      </span>
    );
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDropdownOpen) { setIsDropdownOpen(false); return; }
    if (moreButtonRef.current) {
        const rect = moreButtonRef.current.getBoundingClientRect();
        const dropdownHeight = 176;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        let newPos: { top?: number, bottom?: number, right?: number } = { right: window.innerWidth - rect.right + 8 };
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) { newPos.bottom = window.innerHeight - rect.top; } else { newPos.top = rect.bottom; }
        setPosition(newPos);
        setIsDropdownOpen(true);
    }
  };

  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] w-48 bg-white rounded-md shadow-lg border border-gray-200"
      style={{
        top: position.top ? `${position.top}px` : 'auto',
        right: position.right ? `${position.right}px` : 'auto',
        bottom: position.bottom ? `${position.bottom}px` : 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col py-1">
        <button
          onClick={() => { onViewFile(doc); setIsDropdownOpen(false); }}
          disabled={isActionDisabled}
          title={isProcessing ? "Dokumen sedang diproses" : isIngestFailed ? "Dokumen gagal diproses" : isRejected ? "Dokumen ditolak" : "Lihat Dokumen"}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-transparent"
        >
          <Eye className="w-4 h-4" />
          <span>Lihat Dokumen</span>
        </button>

        <button
          onClick={() => { onNewVersion(doc); setIsDropdownOpen(false); }}
          disabled={isActionDisabled}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-transparent"
          title={isProcessing ? "Tunggu proses selesai" : isIngestFailed ? "Proses gagal, harap hapus dokumen" : "Upload Versi Baru"}
        >
          <UploadIcon className="w-4 h-4" />
          <span>Versi Baru</span>
        </button>

        <button
          onClick={() => { onViewVersions(doc); setIsDropdownOpen(false); }}
          disabled={isActionDisabled}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-transparent"
          title={isProcessing ? "Tunggu proses selesai" : "Lihat Histori"}
        >
          <Info className="w-4 h-4" />
          <span>Lihat Histori</span>
        </button>

        <button
          onClick={() => { onDelete(doc); setIsDropdownOpen(false); }}
          disabled={isDeleteDisabled} // [UPDATE] Tambah disabled
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:bg-transparent"
          title={isDeleteDisabled ? "Sedang diproses, tidak dapat dihapus" : "Hapus Dokumen"}
        >
          <Trash2 className="w-4 h-4" />
          <span>Hapus</span>
        </button>
      </div>
    </div>
  );

  return (
    <tr className="group bg-white hover:bg-gray-50 text-[10px]">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          onChange={(e) => onSelect(e, doc.id)}
          checked={isSelected}
          disabled={isDeleteDisabled} // Checkbox juga sebaiknya disable jika tidak boleh dihapus
          className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-6 py-4">
        {new Date(doc.created_at).toLocaleDateString("id-ID")}
      </td>
      <td className="px-6 py-4 font-medium text-gray-900 break-words">
        {doc.document_name}
      </td>
      <td className="px-6 py-4">{doc.staff}</td>
      <td className="px-6 py-4">
         <span className="font-mono text-[10px] bg-gray-200 text-gray-700 px-2 py-1 rounded">
          {doc.data_type}
        </span>
      </td>
      <td className="px-6 py-4 capitalize">{`${doc.category==='qna'?"Tanya Jawab":doc.category}`}</td>
      <td className="px-6 py-4 ">{doc.team}</td>
      
      <td className="px-6 py-4">{getIngestStatusComponent()}</td>
      <td className="px-6 py-4">{getApprovalStatusComponent()}</td>
      
      <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        
        {/* Layout Desktop */}
        <div className="hidden md:flex justify-center gap-3">
          <button
            onClick={() => onViewFile(doc)} 
            disabled={isActionDisabled}
            title={isProcessing ? "Dokumen sedang diproses" : isIngestFailed ? "Gagal diproses AI" : "Lihat Dokumen"}
            className={`font-medium ${isActionDisabled ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNewVersion(doc)}
            disabled={isActionDisabled}
            className={`font-medium cursor-pointer ${isActionDisabled ? "text-gray-400 cursor-not-allowed" : "text-yellow-600 hover:underline"}`}
            title={isProcessing ? "Tunggu proses selesai" : "Versi Baru"}
          >
            <UploadIcon className="w-4 h-4" />
          </button>
          
          {/* [UPDATE] Tombol Hapus sekarang bisa disabled */}
          <button
            onClick={() => onDelete(doc)} 
            disabled={isDeleteDisabled}
            className={`font-medium cursor-pointer ${isDeleteDisabled ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:underline"}`}
            title={isDeleteDisabled ? "Sedang diproses, tidak dapat dihapus" : "Hapus Dokumen"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onViewVersions(doc)}
            disabled={isActionDisabled}
            className={`font-medium cursor-pointer ${isActionDisabled ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
            title={isProcessing ? "Tunggu proses selesai" : "Lihat Histori"}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Layout Mobile */}
        <div className="md:hidden">
          <button
            ref={moreButtonRef}
            onClick={handleDropdownToggle}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {isDropdownOpen && createPortal(<DropdownContent />, document.body)}
      </td>
    </tr>
  );
};

export default DocumentRow;