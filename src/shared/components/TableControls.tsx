import React, { useCallback, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Filter, Calendar, Check } from "lucide-react";
import CustomSelect from "./CustomSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Helper format date (YYYY-MM-DD)
const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
};

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig<T extends Record<string, any>> {
  key: string;
  label?: string;
  type?: 'select' | 'date-range';
  options?: FilterOption[];
  placeholder?: string;
  startDateKey?: string;
  endDateKey?: string;
}

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
  
  const [activeDropdown, setActiveDropdown] = useState<'filter' | 'date' | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);

  const [tempFilters, setTempFilters] = useState<T>(filters);
  const [tempDateRange, setTempDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const dateRangeConfig = filterConfig.find(c => c.type === 'date-range');
  const dropdownFilters = filterConfig.filter(c => c.type !== 'date-range');

  // --- 1. LOGIKA POSISI RESPONSIF ---
  const updateDropdownPosition = (type: 'filter' | 'date') => {
    const ref = type === 'filter' ? filterBtnRef : dateBtnRef;
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const screenW = window.innerWidth;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Logika Mobile: Jika layar < 640px, paksa align kiri dengan margin
      if (screenW < 640) {
        setCoords({
          top: rect.bottom + scrollY + 8,
          left: 16, // Margin kiri aman 1rem
        });
        return;
      }

      // Logika Desktop: Cek overflow kanan
      const estimatedWidth = type === 'date' ? 340 : 300;
      let leftPos = rect.left + scrollX;

      // Jika dropdown akan keluar layar kanan, geser ke kiri
      if (rect.left + estimatedWidth > screenW) {
        // Align kanan dropdown dengan kanan button/layar
        const rightAlign = rect.right + scrollX;
        leftPos = Math.max(10, rightAlign - estimatedWidth); 
      }

      setCoords({
        top: rect.bottom + scrollY + 6,
        left: leftPos, 
      });
    }
  };

  const toggleDropdown = (type: 'filter' | 'date') => {
    if (activeDropdown === type) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(type);
      setTimeout(() => updateDropdownPosition(type), 0);
    }
  };

  // --- SYNC STATE SAAT DIBUKA ---
  useEffect(() => {
    if (activeDropdown === 'filter') {
      setTempFilters({ ...filters });
    } else if (activeDropdown === 'date' && dateRangeConfig) {
      const startStr = filters[dateRangeConfig.startDateKey as string];
      const endStr = filters[dateRangeConfig.endDateKey as string];
      setTempDateRange([
        startStr ? new Date(startStr) : null, 
        endStr ? new Date(endStr) : null
      ]);
    }
  }, [activeDropdown, filters, dateRangeConfig]);

  // Resize & Scroll Handler
  useEffect(() => {
    const handleResize = () => {
      if (activeDropdown) updateDropdownPosition(activeDropdown);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [activeDropdown]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const portalEl = document.getElementById('table-controls-portal');
      const filterBtn = filterBtnRef.current;
      const dateBtn = dateBtnRef.current;
      const customSelectDropdown = document.getElementById('custom-select-dropdown');

      if (
        portalEl && 
        !portalEl.contains(event.target as Node) &&
        (!filterBtn || !filterBtn.contains(event.target as Node)) &&
        (!dateBtn || !dateBtn.contains(event.target as Node)) &&
        (!customSelectDropdown || !customSelectDropdown.contains(event.target as Node))
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // --- HANDLERS ---

  const handleApplyFilters = () => {
    dropdownFilters.forEach(config => {
      if (tempFilters[config.key] !== filters[config.key]) {
        onFilterChange(config.key, tempFilters[config.key]);
      }
    });
    setActiveDropdown(null);
  };

  const handleApplyDate = () => {
    if (!dateRangeConfig) return;
    const [start, end] = tempDateRange;
    onFilterChange(dateRangeConfig.startDateKey as keyof T, formatDate(start));
    onFilterChange(dateRangeConfig.endDateKey as keyof T, formatDate(end));
    setActiveDropdown(null);
  };

  // --- 2. FIX RESET LOGIC ---
  const handleResetDate = () => {
    // Reset state lokal UI
    setTempDateRange([null, null]);
    
    if (dateRangeConfig) {
      // Pastikan mengirim string KOSONG "" ke parent
      // Ini akan menghapus param date dari API payload
      if (dateRangeConfig.startDateKey) {
        onFilterChange(dateRangeConfig.startDateKey as keyof T, "");
      }
      if (dateRangeConfig.endDateKey) {
        onFilterChange(dateRangeConfig.endDateKey as keyof T, "");
      }
    }
    
    // Tutup dropdown agar user melihat hasil refresh
    setActiveDropdown(null); 
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearchSubmit();
  }, [onSearchSubmit]);

  const getDateButtonLabel = () => {
    if (!dateRangeConfig) return "";
    const start = filters[dateRangeConfig.startDateKey as string];
    const end = filters[dateRangeConfig.endDateKey as string];
    if (start && end) return `${start} - ${end}`;
    if (start) return `${start} - ...`;
    return dateRangeConfig.placeholder || "Select Date Range";
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 py-4">
      {/* SEARCH INPUT */}
      <div className="max-w-md relative flex-grow md:w-1/3">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
        <button
          onClick={onSearchSubmit}
          className="absolute left-0 top-0 mt-2.5 ml-3 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap items-center gap-3">
        {dateRangeConfig && (
          <button
            ref={dateBtnRef}
            onClick={() => toggleDropdown('date')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
              activeDropdown === 'date' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{getDateButtonLabel()}</span>
          </button>
        )}

        {dropdownFilters.length > 0 && (
          <button
            ref={filterBtnRef}
            onClick={() => toggleDropdown('filter')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
              activeDropdown === 'filter' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        )}
      </div>

      {/* PORTAL DROPDOWN CONTENT */}
      {activeDropdown && createPortal(
        <div
          id="table-controls-portal"
          className="absolute z-[9990] bg-white border border-gray-200 rounded-lg shadow-2xl animate-fade-in"
          style={{
            top: coords.top,
            left: coords.left,
            maxWidth: 'calc(100vw - 32px)', // Prevent overflow di mobile
            minWidth: activeDropdown === 'filter' ? '280px' : 'auto' 
          }}
        >
          {/* DATE PICKER CONTENT */}
          {activeDropdown === 'date' && (
            <div className="p-4">
              <div className="overflow-x-auto flex justify-center">
                <DatePicker
                  selected={tempDateRange[0]}
                  onChange={(update) => setTempDateRange(update)}
                  startDate={tempDateRange[0]}
                  endDate={tempDateRange[1]}
                  selectsRange
                  inline
                />
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 gap-2">
                <button
                  onClick={handleResetDate}
                  className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
                >
                  Reset & Refresh
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveDropdown(null)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyDate}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Apply
                  </button>
                </div>
              </div>
              <style>{`
                .react-datepicker { border: none; font-family: inherit; display: block; }
                .react-datepicker__header { background-color: white; border-bottom: 1px solid #f3f4f6; }
                .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: #2563eb !important; color: white !important; }
                .react-datepicker__day--in-selecting-range { background-color: #dbeafe !important; color: #2563eb !important; }
                .react-datepicker__day:hover { background-color: #eff6ff; }
                .react-datepicker__month-container { float: none; }
              `}</style>
            </div>
          )}

          {/* FILTER CONTENT */}
          {activeDropdown === 'filter' && (
            <div className="p-4 w-full md:w-72">
              <div className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Filter Options
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {dropdownFilters.map((config) => (
                  <div key={config.key as string}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      {config.options && config.options[0]?.label.replace("All ", "").replace("AI ", "") || config.label}
                    </label>
                    <CustomSelect
                      options={config.options || []}
                      value={tempFilters[config.key]} 
                      onChange={(value) => setTempFilters(prev => ({ ...prev, [config.key]: value }))}
                      selectedType="default"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end items-center gap-2 mt-5 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setActiveDropdown(null)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3 h-3" /> Apply
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default TableControls;