import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Eye, MoreVertical } from "lucide-react";
import type { ActionType, Document } from "../types/types";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";

interface DocumentActionsProps {
  document: Document;
  hasManagerAccess: boolean;
  onAction: (action: ActionType, doc: Document) => void;
  onViewFile: (doc: Document) => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  document:doc,
  hasManagerAccess,
  onAction,
  onViewFile,
}) => {
  const isPending = doc.is_approve === null;
  const isRejected = doc.is_approve === false;

  // --- State & Ref untuk Dropdown Portal ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  
  // Hook untuk menutup dropdown saat diklik di luar
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsDropdownOpen(false);
  });

  // Handler untuk membuka/menutup dan menghitung posisi dropdown
  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }

    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      
      // Perkiraan tinggi: 3 item * ~40px = 120px
      const dropdownHeight = 140; 
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let newPos: { top?: number, bottom?: number, right?: number } = {
        right: window.innerWidth - rect.right + 8, // 8px dari kanan tombol
      };

      // Jika tidak muat di bawah DAN muat di atas, buka ke atas
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        newPos.bottom = window.innerHeight - rect.top;
      } else {
        // Buka ke bawah (default)
        newPos.top = rect.bottom;
      }
      
      setPosition(newPos);
      setIsDropdownOpen(true);
    }
  };

  // --- Komponen Konten Dropdown (untuk Portal) ---
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
          className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm ${
            isRejected ? "text-gray-400" : "text-gray-700 hover:bg-gray-100"
          } disabled:bg-transparent`}
          title={isRejected ? "Cannot view a rejected document" : "View"}
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>

        {hasManagerAccess && (
          <>
            <button
              onClick={() => { onAction("approve", doc); setIsDropdownOpen(false); }}
              disabled={!isPending}
              className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm ${
                isPending ? "text-green-600 hover:bg-green-50" : "text-gray-400"
              } disabled:bg-transparent`}
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => { onAction("reject", doc); setIsDropdownOpen(false); }}
              disabled={!isPending}
              className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm ${
                isPending ? "text-orange-600 hover:bg-orange-50" : "text-gray-400"
              } disabled:bg-transparent`}
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Layout Desktop: Ikon sejajar */}
      <div className="hidden md:flex items-center justify-center gap-x-3">
        <button
          onClick={() => onViewFile(doc)}
          disabled={isRejected}
          className={`p-1 rounded-md transition-colors ${
            isRejected ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
          }`}
          title={isRejected ? "Cannot view a rejected document" : "View"}
        >
          <Eye className="w-4 h-4" />
        </button>

        {hasManagerAccess && (
          <>
            <button
              onClick={() => onAction("approve", doc)}
              disabled={!isPending}
              className={`p-1 rounded-md transition-colors ${
                isPending ? "text-green-600 hover:bg-green-50" : "text-gray-400 cursor-not-allowed"
              }`}
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAction("reject", doc)}
              disabled={!isPending}
              className={`p-1 rounded-md transition-colors ${
                isPending ? "text-orange-600 hover:bg-orange-50" : "text-gray-400 cursor-not-allowed"
              }`}
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Layout Mobile: Tombol Ellipsis */}
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
    </>
  );
};

export default DocumentActions;