import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export type SortOrder = "asc" | "desc" | "";

interface SortableHeaderProps {
  label: string;
  columnKey: string;
  className?: string;
  sortColumn: string;
  sortDirection: SortOrder;
  onSort: (column: string) => void;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  columnKey,
  className = "",
  sortColumn,
  sortDirection,
  onSort,
}) => {
  const isActive = sortColumn === columnKey;

  const renderIcon = () => {
    
    if (!isActive || !sortDirection) {
      return null;
    }
    
    if (sortDirection === "asc") {
      return <ArrowUp className="w-3 h-3 text-blue-600" />;
    }
    
    return <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <th
      className={`px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors ${className}`}
      onClick={() => onSort(columnKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        
        {/* Panggil fungsi helper renderIcon */}
        {renderIcon()}
        
        {/* Placeholder agar layout tidak lompat saat icon tidak ada */}
        {(!isActive || !sortDirection) && <div className="w-3 h-3" />}
      </div>
    </th>
  );
};