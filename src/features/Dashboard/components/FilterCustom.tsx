import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Period } from '../utils/types';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// --- COMPONENT: DASHBOARD RANGE PICKER ---
// Menggabungkan tampilan From/To tapi menggunakan logika Range Picker
interface DashboardRangePickerProps {
  startDateStr: string;
  endDateStr: string;
  onChange: (start: string, end: string) => void;
}

const DashboardRangePicker: React.FC<DashboardRangePickerProps> = ({ 
  startDateStr, 
  endDateStr, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  
  // Ref untuk container pembungkus agar posisi popover bisa dihitung relatif terhadap area input
  const containerRef = useRef<HTMLDivElement>(null);

  // Konversi string state ke Date object untuk React Datepicker
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;

  const toggleCalendar = () => {
    if (isOpen) {
      setIsOpen(false);
      setCoords(null);
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const screenW = window.innerWidth;
      
      // Default: Align left dengan container
      let left = rect.left + window.scrollX;
      
      // Jika mepet kanan layar, geser ke kiri (lebar kalender datepicker ~240-300px)
      if (left + 300 > screenW) {
        left = Math.max(10, (rect.right + window.scrollX) - 300);
      }

      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: left
      });
      setIsOpen(true);
    }
  };

  // Handle Range Change
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    
    // Helper convert Date -> YYYY-MM-DD string
    const toDateStr = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const adjusted = new Date(d.getTime() - (offset * 60 * 1000));
      return adjusted.toISOString().split('T')[0];
    };

    // Update parent state
    // Jika start null (reset), kirim empty string
    const newStartStr = start ? toDateStr(start) : "";
    const newEndStr = end ? toDateStr(end) : "";

    onChange(newStartStr, newEndStr);

    // Jangan tutup otomatis jika baru pilih start date, tunggu user pilih end date
    // Tapi jika user ingin mengubah start date saja, datepicker tetap terbuka.
    // Opsional: Tutup jika kedua tanggal sudah terisi (end !== null)
    // if (end) setIsOpen(false); 
  };

  // Close when clicking outside
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

  // Tombol visual reusable
  const renderDateBox = (label: string, value: string) => (
    <div 
      className="flex items-center justify-between bg-white py-2 px-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer w-full md:flex-1"
      onClick={toggleCalendar}
    >
      <div className="flex items-center gap-2">
         <span className="text-gray-500 text-xs font-medium min-w-[35px]">{label}:</span>
         <span className="text-sm text-slate-800 font-medium truncate">
           {value || "Select Date"}
         </span>
      </div>
      <Calendar className="w-4 h-4 text-gray-400" />
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto flex-1" ref={containerRef}>
      {/* Tampilan Visual: From & To terpisah tapi fungsinya satu trigger */}
      {renderDateBox("From", startDateStr)}
      {renderDateBox("To", endDateStr)}

      {/* Portal Popover */}
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
            maxDate={new Date()} // Disable future dates
            monthsShown={1} // Tampilkan 1 bulan agar compact
          />
          {/* Style Custom untuk Datepicker */}
          <style>{`
            .react-datepicker { border: none; font-family: inherit; }
            .react-datepicker__header { background-color: white; border-bottom: 1px solid #f3f4f6; }
            .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: #2563eb !important; color: white !important; }
            .react-datepicker__day--in-selecting-range { background-color: #dbeafe !important; color: #2563eb !important; }
            .react-datepicker__day--disabled { color: #ccc !important; cursor: not-allowed; }
            .react-datepicker__day:hover { background-color: #eff6ff; }
            .react-datepicker__month-container { float: none; }
          `}</style>

          {/* Footer Reset Button (Opsional) */}
          <div className="flex justify-end pt-2 border-t border-gray-100 mt-2">
            <button 
              onClick={() => onChange("", "")}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Reset Range
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// --- MAIN COMPONENT: DASHBOARD HEADER ---

interface DashboardHeaderProps {
  onPeriodChange: (period: Period) => void;
  onCustomDateApply: (dates: { startDate: string; endDate: string }) => void;
  defaultPeriod?: Period;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

// Helper
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onPeriodChange,
  onCustomDateApply,
  defaultPeriod = 'daily',
  defaultStartDate = getTodayDateString(),
  defaultEndDate = getTodayDateString(),
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [activePeriod, setActivePeriod] = useState<Period>(defaultPeriod);
  const [isCustomDateVisible, setIsCustomDateVisible] = useState(defaultPeriod === 'custom');
  
  // State String YYYY-MM-DD
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  // Sync dengan props default
  useEffect(() => {
    setActivePeriod(defaultPeriod);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setIsCustomDateVisible(defaultPeriod === 'custom');
  }, [defaultPeriod, defaultStartDate, defaultEndDate]);

  // Jam Realtime
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = currentTime.toLocaleString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const handlePeriodClick = (period: Period) => {
    setActivePeriod(period);
    if (period === 'custom') {
      setIsCustomDateVisible(true);
    } else {
      setIsCustomDateVisible(false);
      onPeriodChange(period);
    }
  };

  const handleApplyClick = () => {
    // Validasi sederhana: Pastikan start dan end terisi sebelum apply
    if (startDate && endDate) {
      onCustomDateApply({ startDate, endDate });
      onPeriodChange('custom');
    }
  };

  const handleRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const buttonBaseClasses = 'py-2 px-3 md:py-1.5 md:px-5 rounded font-medium transition-all duration-300 text-xs flex-1 whitespace-nowrap';
  const buttonInactiveClasses = 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-200';
  const buttonActiveClasses = 'bg-blue-600 text-white shadow-md';

  return (
    <div className="bg-white p-5 px-6 rounded-lg mb-5 border border-gray-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-wrap z-20 relative">
      <div className="flex-shrink-0">
        <h1 className="text-slate-800 text-lg font-semibold mb-1">
          🤖 AI Helpdesk Analytics Dashboard
        </h1>
        <p className="text-gray-500 text-[10px]">
          Real-time monitoring and performance metrics |{' '}
          <span>{formattedTime}</span>
        </p>
      </div>

      <div className={`
        grid w-full md:w-auto 
        transition-[grid-template-rows] duration-300 ease-in-out
        ${isCustomDateVisible ? 'grid-rows-[auto_1fr]' : 'grid-rows-[auto_0fr]'}
      `}>
        {/* BUTTON GROUP PERIOD */}
        <div className="flex gap-2 bg-gray-50 p-1 rounded-md border border-gray-200 items-center w-full mb-2 md:mb-0">
          {(['daily', 'monthly', 'yearly', 'custom'] as const).map((period) => (
             <button
               key={period}
               onClick={() => handlePeriodClick(period)}
               className={`${buttonBaseClasses} ${
                 activePeriod === period ? buttonActiveClasses : buttonInactiveClasses
               }`}
             >
               {period.charAt(0).toUpperCase() + period.slice(1)}
             </button>
          ))}
        </div>

        {/* CUSTOM DATE AREA */}
        <div className="overflow-visible"> 
          {/* Note: overflow-visible agar popover range picker tidak terpotong jika menggunakan relative positioning biasa, 
              tapi karena kita pakai Portal, overflow hidden/visible di container animasi mungkin tidak masalah untuk popover,
              tapi 'h-0' vs 'h-auto' di grid-rows mengontrol layout. */}
              
          <div className={`
            flex flex-col md:flex-row flex-wrap gap-2 items-center 
            transition-all duration-300 ease-in-out
            ${isCustomDateVisible ? 'opacity-100 pt-2' : 'opacity-0 pt-0 h-0 pointer-events-none'}
          `}>
            
            {/* Range Picker Component (From & To UI) */}
            <DashboardRangePicker 
              startDateStr={startDate} 
              endDateStr={endDate} 
              onChange={handleRangeChange} 
            />

            <button
              onClick={handleApplyClick}
              disabled={!startDate || !endDate}
              className="bg-blue-600 text-white py-2 px-5 rounded-md text-sm font-medium transition-all duration-300 hover:bg-blue-700 hover:shadow-md w-full md:w-auto h-[38px] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};