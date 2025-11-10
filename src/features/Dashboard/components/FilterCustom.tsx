import React, { useState, useEffect } from 'react';

// Tentukan tipe untuk periode waktu agar lebih aman
type Period = 'today' | 'monthly' | 'yearly' | 'custom';

// Tentukan props yang akan diterima komponen ini dari parent
interface DashboardHeaderProps {
  onPeriodChange: (period: Period) => void;
  onCustomDateApply: (dates: { startDate: string; endDate: string }) => void;
  defaultPeriod?: Period;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onPeriodChange,
  onCustomDateApply,
  defaultPeriod = 'monthly',
  defaultStartDate = '2025-01-01',
  defaultEndDate = '2025-01-31',
}) => {
  // --- State Internal Komponen ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePeriod, setActivePeriod] = useState<Period>(defaultPeriod);
  const [isCustomDateVisible, setIsCustomDateVisible] = useState(
    defaultPeriod === 'custom'
  );
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  // --- Effects ---
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup function untuk membersihkan interval saat komponen di-unmount
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

  // --- Handlers ---
  const handlePeriodClick = (period: Period) => {
    setActivePeriod(period);

    if (period === 'custom') {
      setIsCustomDateVisible(true);
      // Jangan panggil onPeriodChange dulu, tunggu sampai 'Apply' diklik
    } else {
      setIsCustomDateVisible(false);
      // Langsung panggil event handler dari parent
      onPeriodChange(period);
    }
  };

  const handleApplyClick = () => {
    // Panggil event handler dari parent dengan tanggal yang dipilih
    onCustomDateApply({ startDate, endDate });
    // Set periode 'custom' sebagai aktif setelah apply
    onPeriodChange('custom'); 
  };

  // --- Definisi Kelas Tailwind (untuk readability) ---
  const buttonBaseClasses =
    'py-2 px-3 md:py-1.5 md:px-5 rounded font-medium transition-all duration-300 text-xs flex-1';
  const buttonInactiveClasses =
    'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-200';
  const buttonActiveClasses = 'bg-blue-600 text-white shadow-md';

  return (
    /* --- PERUBAHAN DI SINI: Tambahkan 'flex-wrap' --- */
    <div className="bg-white p-5 px-6 rounded-lg mb-5 border border-gray-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-wrap">
      {/* Bagian Kiri: Judul dan Waktu */}
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
        {/* Filter Tombol Periode (Row 1) */}
        <div className="flex gap-2 bg-gray-50 p-1 rounded-md border border-gray-200 items-center w-full">
          <button
            onClick={() => handlePeriodClick('today')}
            className={`${buttonBaseClasses} ${
              activePeriod === 'today'
                ? buttonActiveClasses
                : buttonInactiveClasses
            }`}
          >
            Today
          </button>
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

        {/* Filter Kustom (Date Picker) (Row 2, 0fr or 1fr) */}
        <div className="overflow-hidden">
          <div className={`
            flex flex-col md:flex-row flex-wrap gap-2 items-center 
            transition-all duration-300 ease-in-out
            ${isCustomDateVisible ? 'opacity-100 pt-4' : 'opacity-0 pt-0'}
          `}>
            {/* Input 'From' */}
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

            {/* Input 'To' */}
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

            {/* Tombol Apply */}
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