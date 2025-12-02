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
  return (
    <tr className="group hover:bg-gray-50 text-[10px] text-gray-700">
      <td className="px-4 py-3 text-center">{new Date(document.created_at).toLocaleDateString("en-GB")}</td>
      <td className="px-4 py-3 font-medium text-gray-900">{document.document_name}</td>
      <td className="px-4 py-3 text-center">{document.staff}</td>
      <td className="px-4 py-3 text-center">
        <span className="font-mono text-[10px] bg-gray-200 text-gray-700 px-2 py-1 rounded">
          {document.data_type}
        </span>
      </td>
      <td className="px-4 py-3 capitalize">{`${document.category==='qna'?"Tanya Jawab":document.category}`}</td>
      
      {/* --- PERUBAHAN DI SINI: Tambahkan Cell Team --- */}
      <td className="px-4 py-3 text-center">
        {/* Gunakan TeamBadge jika ada, atau tampilkan teks biasa */}
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