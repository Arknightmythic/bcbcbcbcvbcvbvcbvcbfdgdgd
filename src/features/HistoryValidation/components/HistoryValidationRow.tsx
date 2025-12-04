import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ActionType, ValidationHistoryItem } from '../utils/types';
import { CheckCircle, XCircle, FileText, MoreVertical } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useClickOutside } from '../../../shared/hooks/useClickOutside';

interface HistoryValidationTableRowProps {
  history: ValidationHistoryItem;
  onAction: (action: ActionType, history: ValidationHistoryItem) => void;
  onViewText: (title: string, content: string) => void; 
}


interface DropdownContentProps {
  dropdownRef: React.RefObject<HTMLDialogElement | null>;
  position: { top?: number; bottom?: number; right?: number };
  isPending: boolean;
  onAction: (action: ActionType, history: ValidationHistoryItem) => void;
  history: ValidationHistoryItem;
  onClose: () => void;
}

const TruncatedText: React.FC<{ content: string; title: string; onIconClick: () => void }> = ({ content, title, onIconClick }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const checkTruncation = () => {
    const el = textRef.current;
    if (el) {
      const isOverflowing = el.scrollHeight > el.clientHeight;
      setIsTruncated(prev => {
        if (prev !== isOverflowing) {
          return isOverflowing;
        }
        return prev;
      });
    }
  };

  useLayoutEffect(() => {
    checkTruncation();
  }, [content]);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>; 
    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        checkTruncation();
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(debounceTimer);
    };
  }, []); 

  return (
    <div className="relative">
      <p 
        ref={textRef}
        className={`
          text-[10px] leading-tight text-gray-700 whitespace-pre-wrap line-clamp-3
          ${isTruncated ? 'pr-6' : ''} 
        `}
        title={isTruncated ? `Klik ikon untuk melihat ${title} selengkapnya` : undefined}
      >
        {content}
      </p>
      
      {isTruncated && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIconClick();
          }}
          className="absolute bottom-0 right-0 p-0.5 text-blue-600 hover:bg-blue-50"
          title={`Lihat ${title} Lengkap`}
        >
          <FileText className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};


const DropdownContent: React.FC<DropdownContentProps> = ({
  dropdownRef,
  position,
  isPending,
  onAction,
  history,
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
    }}
    
    
  >
    <div className="flex flex-col py-1">
      <button
        disabled={!isPending}
        onClick={() => { if(isPending) { onAction('approve', history); onClose(); } }}
        className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm ${
          isPending 
            ? "text-green-600 hover:bg-green-50" 
            : "text-gray-300 cursor-not-allowed"
        }`}
      >
        <CheckCircle className="w-4 h-4" />
        <span>Setujui</span>
      </button>
      <button
        disabled={!isPending}
        onClick={() => { if(isPending) { onAction('reject', history); onClose(); } }}
        className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm ${
          isPending 
            ? "text-red-600 hover:bg-red-50" 
            : "text-gray-300 cursor-not-allowed"
        }`}
      >
        <XCircle className="w-4 h-4" />
        <span>Tolak</span>
      </button>
    </div>
  </dialog>
);

const HistoryValidationTableRow: React.FC<HistoryValidationTableRowProps> = ({ history, onAction, onViewText }) => {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number, bottom?: number, right?: number }>({});
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  
  
  const isPending = history.status_validasi === "Pending";
  
  
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
      const dropdownHeight = 100;
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
    <tr className="group hover:bg-gray-50 text-[10px] text-gray-700">
      <td className="px-4 py-3 text-center">{new Date(history.tanggal).toLocaleDateString("en-GB")}</td>
      <td className="px-4 py-3">{history.user}</td>
      <td className="px-4 py-3">{history.session_id}</td>

      <td className="px-4 py-3 max-w-xs">
        <TruncatedText
          content={history.pertanyaan}
          title="Pertanyaan"
          onIconClick={() => onViewText('Pertanyaan', history.pertanyaan)}
        />
      </td>
      <td className="px-4 py-3 max-w-xs">
        <TruncatedText
          content={history.jawaban_ai}
          title="Jawaban AI"
          onIconClick={() => onViewText('Jawaban AI', history.jawaban_ai)}
        />
      </td>

      <td className="px-4 py-3 capitalize text-center">
        <StatusBadge status={history.status_validasi} />
      </td>
      
      <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        
        {/* Layout Desktop: 2 Tombol (Approve & Reject) */}
        <div className="hidden md:flex items-center justify-center gap-x-2">
          <button
            disabled={!isPending}
            onClick={() => isPending && onAction('approve', history)}
            className={`p-1 rounded-md transition-colors ${
              isPending 
                ? "text-green-600 hover:bg-green-50" 
                : "text-gray-300 cursor-not-allowed"
            }`}
            title={isPending ? "Setujui" : "Status sudah final"}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          
          <button
            disabled={!isPending}
            onClick={() => isPending && onAction('reject', history)}
            className={`p-1 rounded-md transition-colors ${
              isPending 
                ? "text-red-600 hover:bg-red-50" 
                : "text-gray-300 cursor-not-allowed"
            }`}
            title={isPending ? "Tolak" : "Status sudah final"}
          >
            <XCircle className="w-4 h-4" />
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

        {isDropdownOpen && createPortal(
          <DropdownContent 
            dropdownRef={dropdownRef}
            position={position}
            isPending={isPending}
            onAction={onAction}
            history={history}
            onClose={() => setIsDropdownOpen(false)}
          />, 
          document.body
        )}
      </td>
    </tr>
  );
};

export default HistoryValidationTableRow;