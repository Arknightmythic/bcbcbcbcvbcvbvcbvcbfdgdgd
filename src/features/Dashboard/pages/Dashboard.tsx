// [GANTI: src/features/Dashboard/pages/Dashboard.tsx]

import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "../components/FilterCustom";
import { useGenerateGrafanaUrl } from "../hooks/useGrafanaEmbed";
import type {
  Period,
  DashboardFilterState,
  GenerateEmbedRequest,
} from "../utils/types";
import { Loader2 } from "lucide-react";

// --- PERUBAHAN: Definisikan Kunci localStorage ---
const FILTER_STORAGE_KEY = "dashboard_filter_state";

// --- PERUBAHAN: Fungsi helper untuk mendapatkan tanggal hari ini (YYYY-MM-DD) ---
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- PERUBAHAN: Fungsi helper untuk membaca state dari localStorage ---
const getInitialFilterState = (): DashboardFilterState => {
  const savedState = localStorage.getItem(FILTER_STORAGE_KEY);
  if (savedState) {
    try {
      // Pastikan data lama 'today' dimigrasikan ke 'daily'
      const parsed = JSON.parse(savedState) as DashboardFilterState;
      if (parsed.period === ('today' as any)) {
        parsed.period = 'daily';
      }
      return parsed;
    } catch (e) {
      // Abaikan jika JSON korup
    }
  }
  // Default jika tidak ada: 'daily' (sesuai permintaan baru)
  return {
    period: "daily",
    startDate: getTodayDateString(),
    endDate: getTodayDateString(),
  };
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  
  // --- PERUBAHAN: Inisialisasi state dari localStorage ---
  const [filterState, setFilterState] = useState<DashboardFilterState>(
    getInitialFilterState
  );

  const { mutate: getEmbedUrl, isPending: isGeneratingUrl } =
    useGenerateGrafanaUrl();

  // Fungsi untuk mengambil URL, dibungkus useCallback
  const fetchUrl = useCallback((state: DashboardFilterState) => {
    setLoading(true);
    
    const payload: GenerateEmbedRequest = { category: state.period };
    if (state.period === 'custom' && state.startDate && state.endDate) {
      payload.start_date = state.startDate;
      payload.end_date = state.endDate;
    }

    getEmbedUrl(payload, {
      onSuccess: (data) => {
        setIframeUrl(data.data.url);
        // 'loading' akan dimatikan oleh iframe.onLoad
      },
      onError: (err: any) => {
        console.error("Failed to load dashboard:", err);
        setLoading(false);
      },
    });
  }, [getEmbedUrl]); // Dependensi hanya getEmbedUrl

  // useEffect untuk load pertama kali
  useEffect(() => {
    // --- PERUBAHAN: Panggil fetchUrl dengan state awal (dari localStorage/default) ---
    fetchUrl(filterState);
  }, [fetchUrl]); // Hanya dijalankan sekali saat mount (karena fetchUrl stabil)

  const handleLoad = () => {
    setLoading(false);
  };

  // --- PERUBAHAN: Handler untuk periode (Daily, Monthly, Yearly) ---
  const handlePeriodChange = (period: Period) => {
    if (period === "custom") return;

    const newState: DashboardFilterState = { period };
    setFilterState(newState);
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newState)); // Simpan
    fetchUrl(newState);
  };

  // --- PERUBAHAN: Handler untuk tanggal kustom ---
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
    fetchUrl(newState);
  };

  const isOverallLoading = loading || isGeneratingUrl;

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
          {isGeneratingUrl ? "Membuat URL aman..." : "Memuat dashboard..."}
        </p>
      </div>

      {/* --- PERUBAHAN: Kirim state dari localStorage ke FilterHeader --- */}
      <DashboardHeader
        onPeriodChange={handlePeriodChange}
        onCustomDateApply={handleCustomDateApply}
        defaultPeriod={filterState.period}
        defaultStartDate={filterState.startDate || getTodayDateString()}
        defaultEndDate={filterState.endDate || getTodayDateString()}
      />

      {/* --- PERUBAHAN: Tambahkan 'key' agar iframe me-reload --- */}
      <iframe
        src={iframeUrl || undefined}
        key={iframeUrl} // Ini memaksa iframe untuk me-render ulang saat URL berubah
        title="Dashboard"
        onLoad={handleLoad}
        className="w-full flex-1 border-0"
      ></iframe>
    </div>
  );
}

export default Dashboard;