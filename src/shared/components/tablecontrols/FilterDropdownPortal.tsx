import React from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import CustomSelect from "../CustomSelect"; 
import type { FilterConfig } from "./useTableControlsLogic";

interface FilterDropdownPortalProps<T extends Record<string, any>> {
  coords: { top: number; left: number };
  dropdownFilters: FilterConfig<T>[];
  tempFilters: T;
  setTempFilters: React.Dispatch<React.SetStateAction<T>>;
  onApplyFilters: () => void;
  onCancel: () => void;
}

const FilterDropdownPortal = <T extends Record<string, any>>({
  coords,
  dropdownFilters,
  tempFilters,
  setTempFilters,
  onApplyFilters,
  onCancel,
}: FilterDropdownPortalProps<T>) => {
  return createPortal(
    <div
      id="table-controls-portal"
      className="absolute z-[9990] bg-white border border-gray-200 rounded-lg shadow-2xl animate-fade-in"
      style={{
        top: coords.top,
        left: coords.left,
        maxWidth: "calc(100vw - 32px)",
        minWidth: "280px",
      }}
    >
      <div className="p-4 w-full md:w-72">
        <div className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Pilihan Filter
        </div>

        <div className="space-y-4 max-h-[300px] p-1">
          {dropdownFilters.map((config) => (
            <div key={config.key}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {config.options?.[0]?.label
                  .replace("All ", "")
                  .replace("AI ", "") || config.label}
              </label>
              <CustomSelect
                options={config.options || []}
                value={tempFilters[config.key]}
                onChange={(value) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    [config.key]: value,
                  }))
                }
                selectedType="default"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end items-center gap-2 mt-5 pt-3 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onApplyFilters}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm"
          >
            <Check className="w-3 h-3" /> Terapkan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FilterDropdownPortal;