import React from 'react';
import type { ActionType, ValidationHistory } from '../utils/types';
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface HistoryValidationTableRowProps {
  history: ValidationHistory;
  onAction: (action: ActionType, history: ValidationHistory) => void;
}

const HistoryValidationTableRow: React.FC<HistoryValidationTableRowProps> = ({ history, onAction }) => {
  return (
    <tr className="hover:bg-gray-50 text-sm text-gray-700">
      <td className="px-4 py-3 text-center">{new Date(history.tanggal).toLocaleDateString("en-GB")}</td>
      <td className="px-4 py-3">{history.user}</td>
      <td className="px-4 py-3">{history.session_id}</td>
      <td className="px-4 py-3">{history.konteks}</td>
      <td className="px-4 py-3 capitalize text-center">
        <StatusBadge status={history.status} />
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onAction('view', history)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="View Chat History"
        >
          <Eye className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export default HistoryValidationTableRow;