import React from 'react';

import { useDashboardHeaderLogic } from './useDashboardHeaderLogic'; // Import hook
import DashboardRangePicker from './DashboardRangePicker'; // Import range picker
import HeaderPeriodButtons from './HeaderPeriodButtons'; // Import period buttons
import type { Period } from '../utils/types';
import { getTodayDateString } from '../utils/dateUtils';

// --- Props Interface (tetap sama) ---

interface DashboardHeaderProps {
  onPeriodChange: (period: Period) => void;
  onCustomDateApply: (dates: { startDate: string; endDate: string }) => void;
  defaultPeriod?: Period;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

// --- Komponen Utama ---

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onPeriodChange,
  onCustomDateApply,
  defaultPeriod = 'daily',
  defaultStartDate = getTodayDateString(),
  defaultEndDate = getTodayDateString(),
}) => {
  const {
    activePeriod,
    isCustomDateVisible,
    startDate,
    endDate,
    formattedTime,
    handlePeriodClick,
    handleApplyClick,
    handleRangeChange,
    buttonBaseClasses,
    buttonInactiveClasses,
    buttonActiveClasses,
  } = useDashboardHeaderLogic({
    onPeriodChange,
    onCustomDateApply,
    defaultPeriod,
    defaultStartDate,
    defaultEndDate,
  });

  return (
    <div className="bg-white p-5 px-6 rounded-lg mb-5 border border-gray-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-wrap z-20 relative">
      <div className="flex-shrink-0">
        <h1 className="text-slate-800 text-lg font-semibold mb-1">
          🤖 Dashboard Analitik AI Helpdesk
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
        
        {/* Tombol Periode */}
        <HeaderPeriodButtons
            activePeriod={activePeriod}
            handlePeriodClick={handlePeriodClick}
            buttonBaseClasses={buttonBaseClasses}
            buttonInactiveClasses={buttonInactiveClasses}
            buttonActiveClasses={buttonActiveClasses}
        />

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