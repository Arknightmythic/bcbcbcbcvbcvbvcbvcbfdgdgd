// [GANTI: src/features/Dashboard/components/FilterCustom.tsx]

import React, { useState, useEffect } from 'react';
import type { Period } from '../utils/types';

interface DashboardHeaderProps {
  onPeriodChange: (period: Period) => void;
  onCustomDateApply: (dates: { startDate: string; endDate: string }) => void;
  defaultPeriod?: Period;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

// Helper untuk mendapatkan tanggal YYYY-MM-DD
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onPeriodChange,
  onCustomDateApply,
  // --- PERUBAHAN: Ubah default ke 'daily' ---
  defaultPeriod = 'daily',
  defaultStartDate = getTodayDateString(),
  defaultEndDate = getTodayDateString(),
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  // State internal untuk UI (dikontrol oleh props)
  const [activePeriod, setActivePeriod] = useState<Period>(defaultPeriod);
  const [isCustomDateVisible, setIsCustomDateVisible] = useState(
    defaultPeriod === 'custom'
  );
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  // Efek untuk menyinkronkan state internal jika props default berubah (setelah load dari localStorage)
  useEffect(() => {
    setActivePeriod(defaultPeriod);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setIsCustomDateVisible(defaultPeriod === 'custom');
  }, [defaultPeriod, defaultStartDate, defaultEndDate]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = currentTime.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handlePeriodClick = (period: Period) => {
    setActivePeriod(period); // Update state internal UI

    if (period === 'custom') {
      setIsCustomDateVisible(true);
      // Jangan panggil onPeriodChange, tunggu 'Apply'
    } else {
      setIsCustomDateVisible(false);
      onPeriodChange(period); // Panggil parent (Dashboard.tsx)
    }
  };

  const handleApplyClick = () => {
    onCustomDateApply({ startDate, endDate });
    onPeriodChange('custom'); // Panggil parent (Dashboard.tsx)
  };

  const buttonBaseClasses =
    'py-2 px-3 md:py-1.5 md:px-5 rounded font-medium transition-all duration-300 text-xs flex-1';
  const buttonInactiveClasses =
    'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-200';
  const buttonActiveClasses = 'bg-blue-600 text-white shadow-md';

  return (
    <div className="bg-white p-5 px-6 rounded-lg mb-5 border border-gray-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-wrap">
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
        <div className="flex gap-2 bg-gray-50 p-1 rounded-md border border-gray-200 items-center w-full">
          
          {/* --- PERUBAHAN: 'Today' -> 'Daily' --- */}
          <button
            onClick={() => handlePeriodClick('daily')}
            className={`${buttonBaseClasses} ${
              activePeriod === 'daily'
                ? buttonActiveClasses
                : buttonInactiveClasses
            }`}
          >
            Daily
          </button>
          {/* ------------------------------------- */}

          <button
            onClick={() => handlePeriodClick('monthly')}
            className={`${buttonBaseClasses} ${
              activePeriod === 'monthly'
                ? buttonActiveClasses
                : buttonInactiveClasses
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handlePeriodClick('yearly')}
            className={`${buttonBaseClasses} ${
              activePeriod === 'yearly'
                ? buttonActiveClasses
                : buttonInactiveClasses
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => handlePeriodClick('custom')}
            className={`${buttonBaseClasses} ${
              activePeriod === 'custom'
                ? buttonActiveClasses
                : buttonInactiveClasses
            }`}
          >
            Custom
          </button>
        </div>

        <div className="overflow-hidden">
          <div className={`
            flex flex-col md:flex-row flex-wrap gap-2 items-center 
            transition-all duration-300 ease-in-out
            ${isCustomDateVisible ? 'opacity-100 pt-4' : 'opacity-0 pt-0'}
          `}>
            <div className="flex items-center gap-1.5 bg-white py-2 px-3 rounded-md border border-gray-200 w-full md:flex-1">
              <label
                htmlFor="startDate"
                className="text-gray-500 text-xs font-medium"
              >
                From:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-slate-800 text-sm cursor-pointer p-0.5 focus:ring-0 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white py-2 px-3 rounded-md border border-gray-200 w-full md:flex-1">
              <label
                htmlFor="endDate"
                className="text-gray-500 text-xs font-medium"
              >
                To:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-slate-800 text-sm cursor-pointer p-0.5 focus:ring-0 focus:outline-none w-full"
              />
            </div>

            <button
              onClick={handleApplyClick}
              className="bg-blue-600 text-white py-2.5 px-5 rounded-md text-sm font-medium transition-all duration-300 hover:bg-blue-700 hover:shadow-md w-full md:w-auto"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};