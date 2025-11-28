// components/TableControls/TableFilterButton.tsx

import React from "react";
import { Filter } from "lucide-react";

interface TableFilterButtonProps {
  filterBtnRef: React.RefObject<HTMLButtonElement | null>;
  dropdownFiltersCount: number;
  isActive: boolean;
  onClick: () => void;
}

const TableFilterButton: React.FC<TableFilterButtonProps> = ({
  filterBtnRef,
  dropdownFiltersCount,
  isActive,
  onClick,
}) => {
  if (dropdownFiltersCount === 0) return null;

  return (
    <button
      ref={filterBtnRef}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
        isActive
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Filter className="w-4 h-4" />
      Filter
    </button>
  );
};

export default TableFilterButton;