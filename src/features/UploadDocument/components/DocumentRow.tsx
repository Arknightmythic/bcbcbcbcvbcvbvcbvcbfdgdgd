import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom'; // 1. Impor createPortal
import {
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  UploadIcon,
  MoreVertical, // Ikon MoreVertical
} from "lucide-react";
import type { UploadedDocument } from "../types/types";
import { useClickOutside } from "../../../shared/hooks/useClickOutside"; // Impor hook

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
  
  // 2. State & Ref untuk Posisi Portal
  const [position, setPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
  const moreButtonRef = useRef<HTMLButtonElement>(null); // Ref untuk tombol '...'
  
  // 3. Hook click outside sekarang akan merujuk ke menu dropdown
  // (Pastikan useClickOutside.tsx Anda sudah diperbaiki untuk menerima 1 argumen)
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsDropdownOpen(false);
  });
  
  const isPending = doc.is_approve === null;
  const isRejected = doc.is_approve === false;

  const getStatusComponent = () => {
    if (doc.is_approve === true) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircle2 className="w-2 h-2 mr-1" /> Approved
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-red-100 text-red-800">
          <AlertCircle className="w-2 h-2 mr-1" /> Rejected
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-full bg-yellow-100 text-yellow-800">
        <Clock className="w-2 h-2 mr-1" /> Pending
      </span>
    );
  };

  // 4. Handler untuk menghitung posisi & membuka dropdown
  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }

    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      const dropdownHeight = 176; // Perkiraan tinggi: 4 item * 44px
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let newPos: { top?: number, bottom?: number, right?: number } = {
        // Posisikan 8px dari kanan tombol '...'
        right: window.innerWidth - rect.right + 8,
      };

      // Jika tidak muat di bawah DAN muat di atas
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // Buka ke atas: Posisikan 'bottom' dari dropdown
        newPos.bottom = window.innerHeight - rect.top;
      } else {
        // Buka ke bawah (default): Posisikan 'top' dari dropdown
        newPos.top = rect.bottom;
      }
      
      setPosition(newPos);
      setIsDropdownOpen(true);
    }
  };


  // 5. Konten Dropdown (dibuat terpisah agar rapi)
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
          disabled={isRejected}
          title={isRejected ? "Cannot view a rejected document" : "View Document"}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-transparent"
        >
          <Eye className="w-4 h-4" />
          <span>View Document</span>
        </button>

        <button
          onClick={() => { onNewVersion(doc); setIsDropdownOpen(false); }}
          disabled={isPending || isRejected}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-transparent"
          title={isPending ? "Cannot upload new version while pending" : isRejected ? "Cannot upload new version to a rejected document" : "Upload New Version"}
        >
          <UploadIcon className="w-4 h-4" />
          <span>New Version</span>
        </button>

        <button
          onClick={() => { onViewVersions(doc); setIsDropdownOpen(false); }}
          disabled={isPending || isRejected}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:bg-transparent"
          title={isPending ? "Cannot view history while pending" : isRejected ? "Cannot view history of a rejected document" : "View Version History"}
        >
          <Info className="w-4 h-4" />
          <span>View History</span>
        </button>

        <button
          onClick={() => { onDelete(doc); setIsDropdownOpen(false); }}
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          title="Delete Document"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
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
          className="w-2 h-2 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        {new Date(doc.created_at).toLocaleDateString("id-ID")}
      </td>
      <td className="px-6 py-4 font-medium text-gray-900 break-words">
        {doc.document_name}
      </td>
      <td className="px-6 py-4">{doc.staff}</td>
      <td className="px-6 py-4">{doc.data_type}</td>
      <td className="px-6 py-4 capitalize">{doc.category}</td>
      <td className="px-6 py-4 ">{doc.team}</td>
      <td className="px-6 py-4">{getStatusComponent()}</td>
      
      <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        
        {/* Layout Desktop: Ikon sejajar */}
        <div className="hidden md:flex justify-center gap-3">
          <button
            onClick={() => onViewFile(doc)} 
            disabled={isRejected}
            title={isRejected ? "Cannot view a rejected document" : "View Document"}
            className={`font-medium ${isRejected ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline disabled:text-gray-400"}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNewVersion(doc)}
            disabled={isPending || isRejected}
            className={`font-medium cursor-pointer ${isPending || isRejected ? "text-gray-400 cursor-not-allowed" : "text-yellow-600 hover:underline"}`}
            title={isPending ? "Cannot upload new version while pending" : isRejected ? "Cannot upload new version to a rejected document" : "Upload New Version"}
          >
            <UploadIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(doc)} 
            className="font-medium text-red-600 hover:underline cursor-pointer"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewVersions(doc)}
            disabled={isPending || isRejected}
            className={`font-medium cursor-pointer ${isPending || isRejected ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
            title={isPending ? "Cannot view history while pending" : isRejected ? "Cannot view history of a rejected document" : "View Version History"}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Layout Mobile: Tombol Ellipsis */}
        <div className="md:hidden">
          <button
            ref={moreButtonRef} // 6. Terapkan ref
            onClick={handleDropdownToggle} // 7. Terapkan handler
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* 8. Panggil Portal */}
        {isDropdownOpen && createPortal(<DropdownContent />, document.body)}
      </td>
    </tr>
  );
};

export default DocumentRow;