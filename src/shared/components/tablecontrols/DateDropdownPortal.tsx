// components/TableControls/DateDropdownPortal.tsx

import React from "react";
import { createPortal } from "react-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id"; // Import locale Indonesia dari date-fns
import { Check } from "lucide-react";

// Register locale agar dikenali oleh react-datepicker
registerLocale("id", id);

interface DateDropdownPortalProps {
  coords: { top: number; left: number };
  tempDateRange: [Date | null, Date | null];
  setTempDateRange: React.Dispatch<
    React.SetStateAction<[Date | null, Date | null]>
  >;
  onApplyDate: () => void;
  onResetDate: () => void;
  onCancel: () => void;
}

const DateDropdownPortal: React.FC<DateDropdownPortalProps> = ({
  coords,
  tempDateRange,
  setTempDateRange,
  onApplyDate,
  onResetDate,
  onCancel,
}) => {
  return createPortal(
    <div
      id="table-controls-portal"
      className="absolute z-[9990] bg-white border border-gray-200 rounded-lg shadow-2xl animate-fade-in"
      style={{
        top: coords.top,
        left: coords.left,
        maxWidth: "calc(100vw - 32px)",
        minWidth: "auto",
      }}
    >
      <div className="p-4">
        <div className="overflow-x-auto flex justify-center">
          <DatePicker
            selected={tempDateRange[0]}
            onChange={(update) => setTempDateRange(update)}
            startDate={tempDateRange[0]}
            endDate={tempDateRange[1]}
            selectsRange
            inline
            maxDate={new Date()}
            locale="id" // <--- Tambahkan properti ini
          />
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 gap-2">
          <button
            onClick={onResetDate}
            className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors whitespace-nowrap"
          >
            Reset
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onApplyDate}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Terapkan
            </button>
          </div>
        </div>
        {/* Style lokal untuk DatePicker */}
        <style>{`
          .react-datepicker { border: none; font-family: inherit; display: block; }
          .react-datepicker__header { background-color: white; border-bottom: 1px solid #f3f4f6; }
          .react-datepicker__current-month { text-transform: capitalize; } 
          .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: #2563eb !important; color: white !important; }
          .react-datepicker__day--in-selecting-range { background-color: #dbeafe !important; color: #2563eb !important; }
          .react-datepicker__day:hover { background-color: #eff6ff; }
          .react-datepicker__month-container { float: none; }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default DateDropdownPortal;