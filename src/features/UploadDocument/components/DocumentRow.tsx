import React from "react";
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  UploadIcon,
} from "lucide-react";
import type { UploadedDocument } from "../types/types";

interface DocumentRowProps {
  document: UploadedDocument;
  isSelected: boolean;
  onSelect: (event: React.ChangeEvent<HTMLInputElement>, docId: number) => void;
  onDelete: (docId: number) => void;
  onNewVersion: (doc: UploadedDocument) => void; // Renamed from onReplace
  onViewVersions: (doc: UploadedDocument) => void; // New handler for version history
}

const DocumentRow: React.FC<DocumentRowProps> = ({
  document: doc,
  isSelected,
  onSelect,
  onDelete,
  onNewVersion,
  onViewVersions,
}) => {
  const getStatusComponent = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Selesai
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Memproses
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const isViewable = doc.status === "completed";
  const viewUrl = `${import.meta.env.VITE_API_URL_GENERAL}/public${
    doc.file_path
  }`;

  return (
    <tr className="bg-white border-b hover:bg-gray-50 border-gray-200">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          onChange={(e) => onSelect(e, doc.id)}
          checked={isSelected}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        {new Date(doc.upload_date).toLocaleDateString("id-ID")}
      </td>
      <td className="px-6 py-4 font-medium text-gray-900 break-words">
        {doc.document_name}
      </td>
      
      <td className="px-6 py-4">{doc.staff}</td>
      <td className="px-6 py-4">{doc.document_type}</td>
      <td className="px-6 py-4 capitalize">{doc.category}</td>
      <td className="px-6 py-4">{doc.team}</td>
      <td className="px-6 py-4">{getStatusComponent(doc.status)}</td>
      <td className="px-6 py-4 flex-col justify-center">
        <div className="flex justify-center gap-3">
           <a
          href={isViewable ? viewUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          title={isViewable ? "View Document" : "Document not yet completed"}
          className={`font-medium ${
            isViewable
              ? "text-blue-600 hover:underline"
              : "text-gray-400 cursor-not-allowed"
          }`}
          onClick={(e) => !isViewable && e.preventDefault()}
        >
          <Eye className="w-4 h-4" />
        </a>
        {/* Upload New Version */}
        <button
          onClick={() => onNewVersion(doc)}
          className="font-medium text-yellow-600 hover:underline cursor-pointer"
          title="Upload New Version"
        >
          <UploadIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(doc.id)}
          className="font-medium text-red-600 hover:underline cursor-pointer"
          title="Delete Document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
         {/* View Version History */}
        <button
          onClick={() => onViewVersions(doc)}
          className="font-medium text-blue-600 hover:underline cursor-pointer"
          title="View Version History"
        >
          <Info className="w-4 h-4" />
        </button>
        </div>
      </td>
    </tr>
  );
};

export default DocumentRow;
