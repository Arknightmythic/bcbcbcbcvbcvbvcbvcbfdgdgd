import React from "react";
import { Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
import type { ActionType, Document } from "../types/types";

interface DocumentActionsProps {
  document: Document;
  hasManagerAccess: boolean;
  onAction: (action: ActionType, doc: Document) => void;
  onView: (filePath: string) => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  document,
  hasManagerAccess,
  onAction,
  onView,
}) => {
  const isPending = document.status === "pending";
  // Ambil base URL dari environment variable
  const apiUrl = import.meta.env.VITE_API_URL_GENERAL;

  return (
    <div className="flex items-center justify-center gap-x-3">
      {/* Tombol View */}
      <a
        href={`${apiUrl}/${document.file_path}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="View"
      >
        <Eye className="w-5 h-5" />
      </a>

      {/* Tombol Manager */}
      {hasManagerAccess && (
        <>
          <button
            onClick={() => onAction("approve", document)}
            disabled={!isPending}
            className={`p-1 rounded-md transition-colors ${
              isPending
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-400 cursor-not-allowed"
            }`}
            title="Approve"
          >
            <CheckCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => onAction("reject", document)}
            disabled={!isPending}
            className={`p-1 rounded-md transition-colors ${
              isPending
                ? "text-orange-600 hover:bg-orange-50"
                : "text-gray-400 cursor-not-allowed"
            }`}
            title="Reject"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default DocumentActions;
