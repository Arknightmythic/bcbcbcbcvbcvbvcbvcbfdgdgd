import React from "react";
import toast from "react-hot-toast";
import {
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  UploadIcon,
  Loader2,
} from "lucide-react";
import type { UploadedDocument } from "../types/types";


interface DocumentRowProps {
  document: UploadedDocument;
  isSelected: boolean;
  onSelect: (event: React.ChangeEvent<HTMLInputElement>, docId: number) => void;
  onDelete: (doc: UploadedDocument) => void; // <-- Tipe diubah dari (docId: number)
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
  // Menentukan status dokumen
  const isPending = doc.is_approve === null;
  const isRejected = doc.is_approve === false;

  const getStatusComponent = () => {
    if (doc.is_approve === true) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" /> Rejected
        </span>
      );
    }
    // Default-nya adalah pending jika is_approve masih null
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </span>
    );
  };

  return (
    <tr className="bg-white border-b hover:bg-gray-50 border-gray-200">
      {/* Kolom checkbox */}
      <td className="px-4 py-4">
        <input
          type="checkbox"
          onChange={(e) => onSelect(e, doc.id)}
          checked={isSelected}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      {/* Kolom Uploaded Date */}
      <td className="px-6 py-4">
        {new Date(doc.created_at).toLocaleDateString("id-ID")}
      </td>
      {/* Kolom Document Name */}
      <td className="px-6 py-4 font-medium text-gray-900 break-words">
        {doc.document_name}
      </td>
      {/* Kolom Staff */}
      <td className="px-6 py-4">{doc.staff}</td>
      {/* Kolom Type */}
      <td className="px-6 py-4">{doc.data_type}</td>
      {/* Kolom Kategori */}
      <td className="px-6 py-4 capitalize">{doc.category}</td>
      {/* Kolom Team */}
      <td className="px-6 py-4 ">{doc.team}</td>
      {/* Kolom Status */}
      <td className="px-6 py-4">{getStatusComponent()}</td>
      {/* Kolom Action */}
      <td className="px-6 py-4 flex-col justify-center">
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onViewFile(doc)} 
            disabled={isRejected}
            title={
              isRejected ? "Cannot view a rejected document" : "View Document"
            }
            className={`font-medium ${
              isRejected
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:underline disabled:text-gray-400"
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNewVersion(doc)}
            disabled={isPending || isRejected}
            className={`font-medium cursor-pointer ${
              isPending || isRejected
                ? "text-gray-400 cursor-not-allowed"
                : "text-yellow-600 hover:underline"
            }`}
            title={
              isPending
                ? "Cannot upload new version while pending"
                : isRejected
                ? "Cannot upload new version to a rejected document"
                : "Upload New Version"
            }
          >
            <UploadIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(doc)} // <-- Perubahan di sini, kirim seluruh 'doc'
            className="font-medium text-red-600 hover:underline cursor-pointer"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewVersions(doc)}
            disabled={isPending || isRejected}
            className={`font-medium cursor-pointer ${
              isPending || isRejected
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:underline"
            }`}
            title={
              isPending
                ? "Cannot view history while pending"
                : isRejected
                ? "Cannot view history of a rejected document"
                : "View Version History"
            }
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DocumentRow;