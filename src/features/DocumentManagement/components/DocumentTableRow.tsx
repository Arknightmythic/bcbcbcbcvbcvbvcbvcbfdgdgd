import React from 'react';
import StatusBadge from './StatusBadge';
import type { ActionType, Document } from '../types/types';
import DocumentActions from './DocumentActions';
import { Download } from 'lucide-react'; // Impor ikon Download jika belum ada

interface DocumentTableRowProps {
  document: Document;
  hasManagerAccess: boolean;
  onAction: (action: ActionType, doc: Document) => void;
}

const DocumentTableRow: React.FC<DocumentTableRowProps> = ({ document, hasManagerAccess, onAction }) => {
  // URL untuk mengunduh file
  const downloadUrl = `${import.meta.env.VITE_API_BE_URL}/api/documents/download/${document.filename}`;

  return (
    <tr className="hover:bg-gray-50 text-sm text-gray-700">
      <td className="px-4 py-3 text-center">{new Date(document.created_at).toLocaleDateString("en-GB")}</td>
      <td className="px-4 py-3 font-medium text-gray-900">{document.document_name}</td>
      <td className="px-4 py-3 text-center">{document.staff}</td>
      <td className="px-4 py-3 text-center">
        <span className="font-mono text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
          {document.data_type}
        </span>
      </td>
      <td className="px-4 py-3 capitalize">{document.category}</td>
      <td className="px-4 py-3 text-center">
        <StatusBadge isApprove={document.is_approve} />
      </td>
      <td className="px-4 py-3 text-center">
        {/* Komponen DocumentActions diganti dengan logika inline untuk view/download */}
        <div className="flex items-center justify-center gap-x-3">
          {/* Tombol Download (sebelumnya View) */}
          <a
            href={downloadUrl}
            title="Download Document"
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Download className="w-5 h-5" />
          </a>
          
          {/* Aksi Approve/Reject dari DocumentActions tetap ada */}
          <DocumentActions
            document={document} 
            hasManagerAccess={hasManagerAccess} 
            onAction={onAction}
          />
        </div>
      </td>
    </tr>
  );
};

export default DocumentTableRow;