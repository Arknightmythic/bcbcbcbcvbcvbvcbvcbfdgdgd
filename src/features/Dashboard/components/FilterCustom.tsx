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

  // State untuk mengelola waktu saat ini
  const [currentTime, setCurrentTime] = useState(new Date());

  // State untuk melacak tombol periode yang aktif
  const [activePeriod, setActivePeriod] = useState<Period>(defaultPeriod);

  // State untuk menampilkan/menyembunyikan date picker kustom
  const [isCustomDateVisible, setIsCustomDateVisible] = useState(
    defaultPeriod === 'custom'
  );

  // State untuk nilai date picker
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  // --- Effects ---

  // useEffect untuk memperbarui jam setiap detik
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup function untuk membersihkan interval saat komponen di-unmount
    return () => clearInterval(timerId);
  }, []);

  // Format waktu ke string yang diinginkan
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
    'py-1.5 px-5 rounded text-sm font-medium transition-all duration-300 text-xs';
  const buttonInactiveClasses =
    'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-200';
  const buttonActiveClasses = 'bg-blue-600 text-white shadow-md';

  return (
    <div className="bg-white p-5 px-6 rounded-lg mb-5 border border-gray-200 shadow-sm flex justify-between items-center flex-wrap gap-4">
      {/* Bagian Kiri: Judul dan Waktu */}
      <div>
        <h1 className="text-slate-800 text-lg font-semibold mb-1">
          🤖 AI Helpdesk Analytics Dashboard
        </h1>
        <p className="text-gray-500 text-[10px]">
          Real-time monitoring and performance metrics |{' '}
          <span>{formattedTime}</span>
        </p>
      </div>

      {/* Bagian Kanan: Filter */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Tombol Periode */}
        <div className="flex gap-2 bg-gray-50 p-1 rounded-md border border-gray-200 items-center">
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

        {/* Filter Kustom (Date Picker) - Tampil kondisional */}
        {isCustomDateVisible && (
          <div className="flex flex-wrap gap-2 items-center">
            {/* Input 'From' */}
            <div className="flex items-center gap-1.5 bg-white py-2 px-3 rounded-md border border-gray-200">
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
                className="bg-transparent border-none text-slate-800 text-sm cursor-pointer p-0.5 focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Input 'To' */}
            <div className="flex items-center gap-1.5 bg-white py-2 px-3 rounded-md border border-gray-200">
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
                className="bg-transparent border-none text-slate-800 text-sm cursor-pointer p-0.5 focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Tombol Apply */}
            <button
              onClick={handleApplyClick}
              className="bg-blue-600 text-white py-2.5 px-5 rounded-md text-sm font-medium transition-all duration-300 hover:bg-blue-700 hover:shadow-md"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

