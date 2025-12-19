import React from 'react';
import StatusBadge from './StatusBadge';
import type { ActionType, Document } from '../types/types';
import DocumentActions from './DocumentActions';
import TeamBadge from '../../UserManagement/components/TeamBadge'; 

interface DocumentTableRowProps {
  document: Document;
  hasManagerAccess: boolean;
  onAction: (action: ActionType, doc: Document) => void;
  onViewFile: (doc: Document) => void;
}

const DocumentTableRow: React.FC<DocumentTableRowProps> = ({ document, hasManagerAccess, onAction, onViewFile }) => {
  
  // FIX: Menambahkan 'null' pada tipe parameter agar tidak error TS2345
  const getRequestTypeLabel = (type?: string | null) => {
    switch (type) {
      case 'NEW':
        return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold text-[9px]">BARU</span>;
      case 'UPDATE':
        return <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 font-bold text-[9px]">VERSI</span>;
      case 'DELETE':
        return <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-[9px]">HAPUS</span>;
      default:
        return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-bold text-[9px]">-</span>;
    }
  };

  return (
    <tr className="group hover:bg-gray-50 text-[10px] text-gray-700">
      {/* Kolom Tanggal Permintaan (Requested At) */}
      <td className="px-6 py-3">
        {document.requested_at 
          ? new Date(document.requested_at).toLocaleDateString("id-ID")
          : new Date(document.created_at).toLocaleDateString("id-ID")
        }
      </td>
      
      <td className="px-6 py-3 font-medium text-gray-900">{document.document_name}</td>
      <td className="px-6 py-3">{document.staff}</td>
      
      {/* Kolom Tipe Request (Menggantikan Data Type) */}
      <td className="px-4 py-3 text-center">
        {getRequestTypeLabel(document.request_type)}
      </td>

      <td className="px-4 py-3 capitalize">{`${document.category === 'qna' ? "Tanya Jawab" : document.category}`}</td>
      
      <td className="px-4 py-3 text-center">
        <TeamBadge teamName={document.team} />
      </td>

      <td className="px-4 py-3 text-center">
        <StatusBadge isApprove={document.status} />
      </td>
      
      <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
        <div className="flex items-center justify-center gap-x-3">
          <DocumentActions
            document={document} 
            hasManagerAccess={hasManagerAccess} 
            onAction={onAction}
            onViewFile={onViewFile}
          />
        </div>
      </td>
    </tr>
  );
};

export default DocumentTableRow;