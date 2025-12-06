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

interface DropdownContentProps {
  
  dropdownRef: React.RefObject<HTMLDialogElement | null>; 
  position: { top?: number; bottom?: number; right?: number };
  doc: Document;
  hasManagerAccess: boolean;
  isPending: boolean;
  isRejected: boolean;
  onAction: (action: ActionType, doc: Document) => void;
  onViewFile: (doc: Document) => void;
  onClose: () => void;
}

const DropdownContent: React.FC<DropdownContentProps> = ({
  dropdownRef,
  position,
  doc,
  hasManagerAccess,
  isPending,
  isRejected,
  onAction,
  onViewFile,
  onClose
}) => (
  
  <dialog
    ref={dropdownRef}
    open={true} 
    className="fixed z-[9999] w-48 bg-white rounded-md shadow-lg border border-gray-200 p-0 m-0 text-left"
    style={{
      top: position.top ? `${position.top}px` : 'auto',
      right: position.right ? `${position.right}px` : 'auto',
      bottom: position.bottom ? `${position.bottom}px` : 'auto',
      left: 'auto'
    }}
    
    
  >
    <div className="flex flex-col py-1">
      <button
        onClick={() => { onViewFile(doc); onClose(); }}
        disabled={isRejected}
        className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm ${
          isRejected ? "text-gray-400" : "text-gray-700 hover:bg-gray-100"
        } disabled:bg-transparent`}
        title={isRejected ? "Tidak dapat melihat dokumen yang ditolak" : "Lihat"}
      >
        <Eye className="w-4 h-4" />
        <span>Lihat</span>
      </button>

      {hasManagerAccess && (
        <>
          <button
            onClick={() => { onAction("approve", doc); onClose(); }}
            disabled={!isPending}
            className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm ${
              isPending ? "text-green-600 hover:bg-green-50" : "text-gray-400"
            } disabled:bg-transparent`}
            title="Setujui"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Setujui</span>
          </button>
          <button
            onClick={() => { onAction("reject", doc); onClose(); }}
            disabled={!isPending}
            className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm ${
              isPending ? "text-red-600 hover:bg-red-50" : "text-gray-400"
            } disabled:bg-transparent`}
            title="Tolak"
          >
            <XCircle className="w-4 h-4" />
            <span>Tolak</span>
          </button>
        </>
      )}
    </div>
  </dialog>
);

const DocumentActions: React.FC<DocumentActionsProps> = ({
  document: doc,
  hasManagerAccess,
  onAction,
  onViewFile,
}) => {
  const isPending = doc.is_approve === null;
  const isRejected = doc.is_approve === false;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  
  
  const dropdownRef = useClickOutside<HTMLDialogElement>(() => {
    setIsDropdownOpen(false);
  });

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }

    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      
      const dropdownHeight = 140; 
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let newPos: { top?: number, bottom?: number, right?: number } = {
        right: window.innerWidth - rect.right + 8, 
      };

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        newPos.bottom = window.innerHeight - rect.top;
      } else {
        newPos.top = rect.bottom;
      }
      
      setPosition(newPos);
      setIsDropdownOpen(true);
    }
  };

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
          title={isRejected ? "Tidak dapat melihat dokumen yang ditolak" : "Lihat"}
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
              title="Setujui"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAction("reject", doc)}
              disabled={!isPending}
              className={`p-1 rounded-md transition-colors ${
                isPending ? "text-red-600 hover:bg-red-50" : "text-gray-400 cursor-not-allowed"
              }`}
              title="Tolak"
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

     {/* Render Component */}
     {isDropdownOpen && createPortal(
       <DropdownContent 
          dropdownRef={dropdownRef}
          position={position}
          doc={doc}
          hasManagerAccess={hasManagerAccess}
          isPending={isPending}
          isRejected={isRejected}
          onAction={onAction}
          onViewFile={onViewFile}
          onClose={() => setIsDropdownOpen(false)}
       />, 
       document.body
     )}
    </>
  );
};

export default DocumentActions;