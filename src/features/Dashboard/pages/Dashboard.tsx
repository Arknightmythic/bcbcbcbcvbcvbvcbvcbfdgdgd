import { useState } from "react";
import { DashboardHeader } from "../components/FilterCustom";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const handleLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000); 
  };

  const [currentPeriod, setCurrentPeriod] = useState('monthly');
  const [customDates, setCustomDates] = useState({
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  });

  // Handler untuk menerima data dari komponen header
  const handlePeriodChange = (period: string) => {
    console.log('Periode berubah menjadi:', period);
    setCurrentPeriod(period);
    // Di sini Anda bisa memanggil API untuk mengambil data baru
    // fetchData(period);
  };

  const handleCustomDateApply = (dates: {
    startDate: string;
    endDate: string;
  }) => {
    console.log('Tanggal kustom diterapkan:', dates);
    setCustomDates(dates);
    // Di sini Anda bisa memanggil API dengan tanggal kustom
    // fetchData('custom', dates.startDate, dates.endDate);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className={`
          absolute inset-0 flex items-center justify-center bg-white z-10 
          transition-opacity duration-500 ease-in-out
          ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <p className="text-gray-400 text-center px-6 py-4">Loading...</p>
      </div>
      <DashboardHeader
        onPeriodChange={handlePeriodChange}
        onCustomDateApply={handleCustomDateApply}
        defaultPeriod="monthly" // Anda bisa set default period di sini
      />

      <iframe
        // src={`${import.meta.env.VITE_IFRAME_GRAPHANA_URL}?&theme=light`}
        src="/DashboardBKPM (3).html"
        title="Dashboard"
        onLoad={handleLoad}
        className="w-full h-full border-0 zoomed-iframe"
      ></iframe>
    </div>
  );
}

export default Dashboard;