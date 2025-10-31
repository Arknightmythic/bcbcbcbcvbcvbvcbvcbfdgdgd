import React, { useState } from "react";
import toast from "react-hot-toast";
import { Trash2, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import type { ActionType, Document } from "../types/types";
import { instanceApiToken } from "../../../shared/utils/Axios";

interface DocumentActionsProps {
  document: Document;
  hasManagerAccess: boolean;
  onAction: (action: ActionType, doc: Document) => void;
  // Prop 'onView' dihapus dari sini
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  document,
  hasManagerAccess,
  onAction,
}) => {
  const [isViewing, setIsViewing] = useState(false);
  const isPending = document.is_approve === null;

  const handleViewFile = async () => {
    setIsViewing(true);
    const viewUrl = `${import.meta.env.VITE_API_BE_URL}/api/documents/download/${document.filename}`;
    try {
      const response = await instanceApiToken.get(viewUrl, { responseType: 'blob' });
      const contentType = response.headers['content-type'] || `application/${document.data_type}`;
      const fileBlob = new Blob([response.data], { type: contentType });
      const fileUrl = URL.createObjectURL(fileBlob);
      window.open(fileUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
    } catch (error) {
      console.error("Failed to open file:", error);
      toast.error("Could not open the file.");
    } finally {
      setIsViewing(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-x-3">
      {/* <button
        onClick={handleViewFile}
        disabled={isViewing}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:text-gray-400"
        title="View"
      >
        {isViewing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
      </button> */}

      {hasManagerAccess && (
        <>
          <button
            onClick={() => onAction("approve", document)}
            disabled={!isPending}
            className={`p-1 rounded-md transition-colors ${
              isPending ? "text-green-600 hover:bg-green-50" : "text-gray-400 cursor-not-allowed"
            }`}
            title="Approve"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => onAction("reject", document)}
            disabled={!isPending}
            className={`p-1 rounded-md transition-colors ${
              isPending ? "text-orange-600 hover:bg-orange-50" : "text-gray-400 cursor-not-allowed"
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