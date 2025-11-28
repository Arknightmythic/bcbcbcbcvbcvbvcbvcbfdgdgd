// components/TableControls/TableSearch.tsx

import React from "react";
import { Search } from "lucide-react";

interface TableSearchProps {
  searchTerm: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const TableSearch: React.FC<TableSearchProps> = ({
  searchTerm,
  searchPlaceholder,
  onSearchChange,
  onSearchSubmit,
  onKeyDown,
}) => (
  <div className="flex w-full md:w-1/3 gap-2">
    <div className="relative flex-grow">
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
      />
    </div>

    <button
      onClick={onSearchSubmit}
      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      aria-label="cari"
    >
      <Search className="w-4 h-4" />
    </button>
  </div>
);

export default TableSearch;