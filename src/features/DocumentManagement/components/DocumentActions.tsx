import {CheckCircle, XCircle, Eye} from "lucide-react";
import type { ActionType, Document } from "../types/types";

interface DocumentActionsProps {
  document: Document;
  hasManagerAccess: boolean;
  onAction: (action: ActionType, doc: Document) => void;
  onViewFile: (doc: Document) => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  document,
  hasManagerAccess,
  onAction,
  onViewFile,
}) => {
  const isPending = document.is_approve === null;
  const isRejected = document.is_approve === false;


  return (
    <div className="flex items-center justify-center gap-x-3">
      <button
        onClick={() => onViewFile(document)} // <-- 3. UBAH ONCLICK
        disabled={isRejected} // <-- 4. UPDATE LOGIKA DISABLE
        className={`p-1 rounded-md transition-colors ${
          isRejected ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
        }`}
        title={isRejected ? "Cannot view a rejected document" : "View"}
      >
        <Eye className="w-4 h-4" />
      </button>

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
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAction("reject", document)}
            disabled={!isPending}
            className={`p-1 rounded-md transition-colors ${
              isPending ? "text-orange-600 hover:bg-orange-50" : "text-gray-400 cursor-not-allowed"
            }`}
            title="Reject"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default DocumentActions;