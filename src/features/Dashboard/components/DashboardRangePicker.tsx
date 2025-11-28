// components/DashboardHeader/DashboardRangePicker.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDateStr } from '../utils/dateUtils';


interface DashboardRangePickerProps {
  startDateStr: string;
  endDateStr: string;
  onChange: (start: string, end: string) => void;
}


const DateDisplayBox: React.FC<{ label: string; value: string; onClick: () => void }> = ({ 
  label, 
  value, 
  onClick 
}) => (
  <div 
    className="flex items-center justify-between bg-white py-2 px-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer w-full md:flex-1 gap-2"
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      <span className="text-gray-500 text-xs font-medium min-w-[35px]">{label}:</span>
      <span className="text-sm text-slate-800 font-medium truncate">
        {value || "FIlter Tanggal"} 
      </span>
    </div>
    <Calendar className="w-4 h-4 text-gray-400" />
  </div>
);


const DashboardRangePicker: React.FC<DashboardRangePickerProps> = ({ 
  startDateStr, 
  endDateStr, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDate = useMemo(() => startDateStr ? new Date(startDateStr) : null, [startDateStr]);
  const endDate = useMemo(() => endDateStr ? new Date(endDateStr) : null, [endDateStr]);
  
  const toggleCalendar = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
      setCoords(null);
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const screenW = window.innerWidth;
      
      let left = rect.left + window.scrollX;
      
      // Perhitungan posisi
      if (left + 300 > screenW) {
        left = Math.max(10, (rect.right + window.scrollX) - 300);
      }

      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: left
      });
      setIsOpen(true);
    }
  }, [isOpen]);


  const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    
    const newStartStr = start ? toDateStr(start) : "";
    const newEndStr = end ? toDateStr(end) : "";

    onChange(newStartStr, newEndStr);
  }, [onChange]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const portal = document.getElementById('dashboard-range-portal');
      
      if (
        portal && !portal.contains(target) && 
        containerRef.current && !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleResetRange = () => {
    onChange("", "");
    setIsOpen(false);
    setCoords(null);
  }

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto flex-1" ref={containerRef}>
      <DateDisplayBox label="Dari" value={startDateStr} onClick={toggleCalendar} /> 
      <DateDisplayBox label="Sampai" value={endDateStr} onClick={toggleCalendar} />

      {isOpen && coords && createPortal(
        <div
          id="dashboard-range-portal"
          className="absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl p-3 animate-fade-in"
          style={{ top: coords.top, left: coords.left }}
        >
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            maxDate={new Date()} 
            monthsShown={1} 
          />
          <style>{`
            .react-datepicker { border: none; font-family: inherit; }
            .react-datepicker__header { background-color: white; border-bottom: 1px solid #f3f4f6; }
            .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: #2563eb !important; color: white !important; }
            .react-datepicker__day--in-selecting-range { background-color: #dbeafe !important; color: #2563eb !important; }
            .react-datepicker__day--disabled { color: #ccc !important; cursor: not-allowed; }
            .react-datepicker__day:hover { background-color: #eff6ff; }
            .react-datepicker__month-container { float: none; }
          `}</style>

          <div className="flex justify-end pt-2 border-t border-gray-100 mt-2">
            <button 
              onClick={handleResetRange} 
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Reset Rentang
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DashboardRangePicker;