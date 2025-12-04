import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Period } from '../utils/types';
import { Calendar } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker'; 
import { id } from 'date-fns/locale/id'; 
import "react-datepicker/dist/react-datepicker.css";

registerLocale('id', id);

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

  const containerRef = useRef<HTMLDivElement>(null);

  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate = endDateStr ? new Date(endDateStr) : null;

  const toggleCalendar = () => {
    if (isOpen) {
      setIsOpen(false);
      setCoords(null);
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const screenW = window.innerWidth;
      
      let left = rect.left + window.scrollX;
      
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

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    
    const toDateStr = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const adjusted = new Date(d.getTime() - (offset * 60 * 1000));
      return adjusted.toISOString().split('T')[0];
    };

    
    const newStartStr = start ? toDateStr(start) : "";
    const newEndStr = end ? toDateStr(end) : "";

    onChange(newStartStr, newEndStr);
  };

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

  
  
  
  const renderDateBox = (label: string, value: string) => (
    <button 
      type="button" 
      className="flex items-center justify-between bg-white py-2 px-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer w-full md:flex-1 text-left"
      onClick={toggleCalendar}
    >
      <div className="flex items-center gap-2 pointer-events-none">
         <span className="text-gray-500 text-xs font-medium min-w-[35px]">{label}:</span>
         <span className="text-sm text-slate-800 font-medium truncate">
           {value || "Filter Tanggal"}
         </span>
      </div>
      <Calendar className="w-4 h-4 text-gray-400 pointer-events-none" />
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto flex-1" ref={containerRef}>
      {renderDateBox("Dari", startDateStr)}
      {renderDateBox("Sampai", endDateStr)}

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
            locale="id" 
          />
          <style>{`
            .react-datepicker { border: none; font-family: inherit; }
            .react-datepicker__header { background-color: white; border-bottom: 1px solid #f3f4f6; }
            .react-datepicker__current-month { text-transform: capitalize; } 
            .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: #2563eb !important; color: white !important; }
            .react-datepicker__day--in-selecting-range { background-color: #dbeafe !important; color: #2563eb !important; }
            .react-datepicker__day--disabled { color: #ccc !important; cursor: not-allowed; }
            .react-datepicker__day:hover { background-color: #eff6ff; }
            .react-datepicker__month-container { float: none; }
          `}</style>

          <div className="flex justify-end pt-2 border-t border-gray-100 mt-2">
            <button 
              onClick={() => onChange("", "")}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
              type="button" 
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


interface DashboardHeaderProps {
  onPeriodChange: (period: Period) => void;
  onCustomDateApply: (dates: { startDate: string; endDate: string }) => void;
  defaultPeriod?: Period;
  defaultStartDate?: string;
  defaultEndDate?: string;
}
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
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  
  useEffect(() => {
    setActivePeriod(defaultPeriod);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setIsCustomDateVisible(defaultPeriod === 'custom');
  }, [defaultPeriod, defaultStartDate, defaultEndDate]);

  
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

  const periodLabels: Record<string, string> = {
    daily: 'Harian',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
    custom: 'Custom'
  };

  return (
    <div className="bg-white p-5 px-6 rounded-lg mb-5 border border-gray-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-wrap z-20 relative">
      <div className="flex-shrink-0">
        <h1 className="text-slate-800 text-lg font-semibold mb-1">
          🤖 Dasbor Analitik
        </h1>
        <p className="text-gray-500 text-[10px]">
          Pemantauan dan metrik performa real-time |{' '}
          <span>{formattedTime}</span>
        </p>
      </div>

      <div className={`
        grid w-full md:w-auto 
        transition-[grid-template-rows] duration-300 ease-in-out
        ${isCustomDateVisible ? 'grid-rows-[auto_1fr]' : 'grid-rows-[auto_0fr]'}
      `}>

        <div className="flex gap-2 bg-gray-50 p-1 rounded-md border border-gray-200 items-center w-full mb-2 md:mb-0">
          {(['daily', 'monthly', 'yearly', 'custom'] as const).map((period) => (
             <button
               key={period}
               onClick={() => handlePeriodClick(period)}
               type="button"
               className={`${buttonBaseClasses} ${
                 activePeriod === period ? buttonActiveClasses : buttonInactiveClasses
               }`}
             >
               {periodLabels[period]}
             </button>
          ))}
        </div>


        <div className="overflow-visible"> 
          
          <div className={`
            flex flex-col md:flex-row flex-wrap gap-2 items-center 
            transition-all duration-300 ease-in-out
            ${isCustomDateVisible ? 'opacity-100 pt-2' : 'opacity-0 pt-0 h-0 pointer-events-none'}
          `}>
            

            <DashboardRangePicker 
              startDateStr={startDate} 
              endDateStr={endDate} 
              onChange={handleRangeChange} 
            />

            <button
              onClick={handleApplyClick}
              disabled={!startDate || !endDate}
              type="button" 
              className="bg-blue-600 text-white py-2 px-5 rounded-md text-sm font-medium transition-all duration-300 hover:bg-blue-700 hover:shadow-md w-full md:w-auto h-[38px] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};