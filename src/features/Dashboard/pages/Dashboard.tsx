// [GANTI: src/features/Dashboard/pages/Dashboard.tsx]

import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "../components/FilterCustom";
// import { useGenerateGrafanaUrl } from "../hooks/useGrafanaEmbed"; // DINONAKTIFKAN SEMENTARA
import type {
  Period,
  DashboardFilterState,
  // GenerateEmbedRequest, // DINONAKTIFKAN SEMENTARA
} from "../utils/types";
import { Loader2 } from "lucide-react";

const FILTER_STORAGE_KEY = "dashboard_filter_state";

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const getInitialFilterState = (): DashboardFilterState => {
  const savedState = localStorage.getItem(FILTER_STORAGE_KEY);
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState) as DashboardFilterState;
      if (parsed.period === ('today' as any)) {
        parsed.period = 'daily';
      }
      return parsed;
    } catch (e) {
      // Abaikan jika JSON korup
    }
  }
  return {
    period: "daily",
    startDate: getTodayDateString(),
    endDate: getTodayDateString(),
  };
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  
  // --- PERUBAHAN: Langsung arahkan ke file HTML statis di folder /public ---
  const [iframeUrl, setIframeUrl] = useState<string | null>('/DashboardBKPM.html');
  
  const [filterState, setFilterState] = useState<DashboardFilterState>(
    getInitialFilterState
  );

  // --- DINONAKTIFKAN SEMENTARA ---
  // const { mutate: getEmbedUrl, isPending: isGeneratingUrl } =
  //   useGenerateGrafanaUrl();
  // -----------------------------

  // --- DINONAKTIFKAN SEMENTARA ---
  // Fungsi untuk mengambil URL, dibungkus useCallback
  // const fetchUrl = useCallback((state: DashboardFilterState) => {
  //   setLoading(true);
    
  //   const payload: GenerateEmbedRequest = { category: state.period };
  //   if (state.period === 'custom' && state.startDate && state.endDate) {
  //     payload.start_date = state.startDate;
  //     payload.end_date = state.endDate;
  //   }

  //   getEmbedUrl(payload, {
  //     onSuccess: (data) => {
  //       setIframeUrl(data.data.url);
  //       // 'loading' akan dimatikan oleh iframe.onLoad
  //     },
  //     onError: (err: any) => {
  //       console.error("Failed to load dashboard:", err);
  //       setLoading(false);
  //     },
  //   });
  // }, [getEmbedUrl]); // Dependensi hanya getEmbedUrl
  // -----------------------------

  
  // --- DINONAKTIFKAN SEMENTARA ---
  // useEffect untuk load pertama kali
  // useEffect(() => {
  //   fetchUrl(filterState);
  // }, [fetchUrl]);
  // -----------------------------

  const handleLoad = () => {
    setLoading(false);
  };

  // Handler untuk periode (Daily, Monthly, Yearly)
  const handlePeriodChange = (period: Period) => {
    if (period === "custom") return;

    const newState: DashboardFilterState = { period };
    setFilterState(newState);
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newState)); // Simpan
    
    // fetchUrl(newState); // DINONAKTIFKAN SEMENTARA
  };

  // Handler untuk tanggal kustom
  const handleCustomDateApply = (dates: {
    startDate: string;
    endDate: string;
  }) => {
    const newState: DashboardFilterState = {
      period: "custom",
      startDate: dates.startDate,
      endDate: dates.endDate,
    };
    setFilterState(newState);
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newState)); // Simpan
    
    // fetchUrl(newState); // DINONAKTIFKAN SEMENTARA
  };

  // --- PERUBAHAN: 'isGeneratingUrl' tidak ada, jadi hanya 'loading' ---
  const isOverallLoading = loading;

  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        className={`
          absolute inset-0 flex flex-col items-center justify-center bg-white z-10 
          transition-opacity duration-300 ease-in-out
          ${isOverallLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-500 mt-3 text-sm">
          {/* --- PERUBAHAN: Hapus teks 'Membuat URL aman...' --- */}
          Memuat dashboard...
        </p>
      </div>

      {/* <DashboardHeader
        onPeriodChange={handlePeriodChange}
        onCustomDateApply={handleCustomDateApply}
        defaultPeriod={filterState.period}
        defaultStartDate={filterState.startDate || getTodayDateString()}
        defaultEndDate={filterState.endDate || getTodayDateString()}
      /> */}

      <iframe
        src={iframeUrl || undefined}
        key={iframeUrl} // 'key' tetap ada, meskipun URL statis
        title="Dashboard"
        onLoad={handleLoad}
        className="w-full flex-1 border-0"
      ></iframe>
    </div>
  );
}

export default Dashboard;