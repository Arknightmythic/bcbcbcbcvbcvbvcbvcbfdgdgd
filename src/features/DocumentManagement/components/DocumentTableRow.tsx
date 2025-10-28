import React from 'react';
import StatusBadge from './StatusBadge';
import type { ActionType, Document } from '../types/types';
import DocumentActions from './DocumentActions';


interface DocumentTableRowProps {
  document: Document;
  hasManagerAccess: boolean;
  onAction: (action: ActionType, doc: Document) => void;
}

const DocumentTableRow: React.FC<DocumentTableRowProps> = ({ document, hasManagerAccess, onAction }) => {
  const handleView = (filePath: string) => {
    // Logika view ditangani langsung di DocumentActions dengan <a> tag
  };
  
  return (
    <tr className="hover:bg-gray-50 text-sm text-gray-700">
      <td className="px-4 py-3 text-center">{new Date(document.upload_date).toLocaleDateString("en-GB")}</td>
      <td className="px-4 py-3 font-medium text-gray-900">{document.document_name}</td>
      <td className="px-4 py-3 text-center">{document.staff}</td>
      <td className="px-4 py-3 text-center">
        <span className="font-mono text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
          {document.document_type}
        </span>
      </td>
      {/* Kolom Kategori Baru */}
      <td className="px-4 py-3 capitalize">{document.category}</td>
      <td className="px-4 py-3 text-center">
        <StatusBadge status={document.status} />
      </td>
      <td className="px-4 py-3 text-center">
        <DocumentActions
          document={document} 
          hasManagerAccess={hasManagerAccess} 
          onAction={onAction}
          onView={handleView}
        />
      </td>
    </tr>
  );
};

export default DocumentTableRow;