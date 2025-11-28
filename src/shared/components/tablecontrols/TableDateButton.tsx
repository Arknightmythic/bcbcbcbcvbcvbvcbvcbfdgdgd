// components/TableControls/TableDateButton.tsx

import React from "react";
import { Calendar } from "lucide-react";
import type { FilterConfig } from "./useTableControlsLogic";


interface TableDateButtonProps<T extends Record<string, any>> {
  dateBtnRef: React.RefObject<HTMLButtonElement | null>;
  dateRangeConfig: FilterConfig<T> | undefined;
  getDateButtonLabel: () => string;
  isActive: boolean;
  onClick: () => void;
}

const TableDateButton = <T extends Record<string, any>>({
  dateBtnRef,
  dateRangeConfig,
  getDateButtonLabel,
  isActive,
  onClick,
}: TableDateButtonProps<T>) => {
  if (!dateRangeConfig) return null;

  return (
    <button
      ref={dateBtnRef}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
        isActive
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Calendar className="w-4 h-4" />
      <span className="truncate max-w-[200px]">{getDateButtonLabel()}</span>
    </button>
  );
};

export default TableDateButton;