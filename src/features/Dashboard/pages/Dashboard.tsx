import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "../components/FilterCustom";
import { useGenerateGrafanaUrl } from "../hooks/useGrafanaEmbed";
import type {
  Period,
  DashboardFilterState,
  GenerateEmbedRequest,
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
      // Abaikan error JSON
    }
  }
  return {
    period: "daily",
    startDate: getTodayDateString(),
    endDate: getTodayDateString(),
  };
};

function Dashboard() {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  
  const [filterState, setFilterState] = useState<DashboardFilterState>(
    getInitialFilterState
  );

  const { mutate: getEmbedUrl, isPending: isGeneratingUrl } = useGenerateGrafanaUrl();

  const fetchUrl = useCallback((state: DashboardFilterState) => {
    setIframeLoading(true);
    
    const payload: GenerateEmbedRequest = { category: state.period };
    
    if (state.period === 'custom' && state.startDate && state.endDate) {
      payload.start_date = state.startDate;
      payload.end_date = state.endDate;
    }

    getEmbedUrl(payload, {
      onSuccess: (data) => {
        setIframeUrl(data.data.url);
      },
      onError: (err: any) => {
        console.error("Failed to load dashboard:", err);
        setIframeLoading(false); 
      },
    });
  }, [getEmbedUrl]);

  useEffect(() => {
    fetchUrl(filterState);
  }, [fetchUrl, filterState]);

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  const handlePeriodChange = (period: Period) => {
    if (period === "custom") return;

    const newState: DashboardFilterState = { 
      ...filterState,
      period 
    };
    setFilterState(newState);
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newState));
  };

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
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newState));
  };

  const isOverallLoading = isGeneratingUrl || iframeLoading;

  return (
    <div className="w-full h-full flex flex-col">
      {/* 1. HEADER: Ditempatkan di luar area loading */}
      <DashboardHeader
        onPeriodChange={handlePeriodChange}
        onCustomDateApply={handleCustomDateApply}
        defaultPeriod={filterState.period}
        defaultStartDate={filterState.startDate || getTodayDateString()}
        defaultEndDate={filterState.endDate || getTodayDateString()}
      />

      {/* 2. CONTENT AREA: Wrapper relatif untuk Iframe & Loading */}
      <div className="relative flex-1 w-full flex flex-col min-h-0">
        
        {/* Loading Overlay (Hanya menutupi area ini) */}
        <div
          className={`
            absolute inset-0 flex flex-col items-center justify-center bg-white z-10 
            transition-opacity duration-300 ease-in-out
            ${isOverallLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500 mt-3 text-sm">
            {isGeneratingUrl ? "Membuat sesi aman..." : "Memuat visualisasi..."}
          </p>
        </div>

        {/* Iframe */}
        {iframeUrl && (
          <iframe
            src={iframeUrl}
            key={iframeUrl}
            title="Grafana Dashboard"
            onLoad={handleIframeLoad}
            className="w-full flex-1 border-0 rounded-lg shadow-sm"
          ></iframe>
        )}
      </div>
    </div>
  );
}

export default Dashboard;