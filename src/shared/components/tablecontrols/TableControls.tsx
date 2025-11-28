// components/TableControls/TableControls.tsx

import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  useTableControlsLogic,
  type FilterConfig,
  type FilterOption,
} from "./useTableControlsLogic"; // Import hook logic

// Import komponen UI yang dipecah
import TableSearch from "./TableSearch";
import TableDateButton from "./TableDateButton";
import TableFilterButton from "./TableFilterButton";
import DateDropdownPortal from "./DateDropdownPortal";
import FilterDropdownPortal from "./FilterDropdownPortal";

// Export Interfaces yang diperlukan
export type { FilterOption, FilterConfig };

interface TableControlsProps<T extends Record<string, any>> {
  searchTerm: string;
  searchPlaceholder: string;
  filters: T;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onFilterChange: (filterName: keyof T, value: any) => void;
  filterConfig: FilterConfig<T>[];
}

const TableControls = <T extends Record<string, any>>({
  searchTerm,
  searchPlaceholder,
  filters,
  onSearchChange,
  onSearchSubmit,
  onFilterChange,
  filterConfig,
}: React.PropsWithChildren<TableControlsProps<T>>) => {
  // Gunakan Logic Hook
  const {
    activeDropdown,
    coords,
    filterBtnRef,
    dateBtnRef,
    tempFilters,
    tempDateRange,
    dateRangeConfig,
    dropdownFilters,
    toggleDropdown,
    handleApplyFilters,
    handleApplyDate,
    handleResetDate,
    handleKeyDown,
    getDateButtonLabel,
    setTempFilters,
    setTempDateRange,
  } = useTableControlsLogic({
    filters,
    onFilterChange,
    filterConfig,
    searchTerm,
    onSearchSubmit,
  });

  const handleCancelDropdown = () => {
    // Logic hook sudah memiliki akses ke setActiveDropdown dan setCoords
    toggleDropdown(activeDropdown as "filter" | "date"); 
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 py-4">
      {/* 1. Search Component */}
      <TableSearch
        searchTerm={searchTerm}
        searchPlaceholder={searchPlaceholder}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onKeyDown={handleKeyDown}
      />

      <div className="flex flex-wrap items-center gap-3">
        {/* 2. Date Range Button */}
        <TableDateButton
          dateBtnRef={dateBtnRef}
          dateRangeConfig={dateRangeConfig}
          getDateButtonLabel={getDateButtonLabel}
          isActive={activeDropdown === "date"}
          onClick={() => toggleDropdown("date")}
        />

        {/* 3. Filter Button */}
        <TableFilterButton
          filterBtnRef={filterBtnRef}
          dropdownFiltersCount={dropdownFilters.length}
          isActive={activeDropdown === "filter"}
          onClick={() => toggleDropdown("filter")}
        />
      </div>

      {/* 4. Dropdown Portals */}
      {activeDropdown === "date" && coords && (
        <DateDropdownPortal
          coords={coords}
          tempDateRange={tempDateRange}
          setTempDateRange={setTempDateRange}
          onApplyDate={handleApplyDate}
          onResetDate={handleResetDate}
          onCancel={handleCancelDropdown}
        />
      )}

      {activeDropdown === "filter" && coords && (
        <FilterDropdownPortal
          coords={coords}
          dropdownFilters={dropdownFilters}
          tempFilters={tempFilters}
          setTempFilters={setTempFilters}
          onApplyFilters={handleApplyFilters}
          onCancel={handleCancelDropdown}
        />
      )}
    </div>
  );
};

export default TableControls;