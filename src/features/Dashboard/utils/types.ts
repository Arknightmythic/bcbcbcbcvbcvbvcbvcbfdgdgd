// [GANTI: src/features/Dashboard/utils/types.ts]

export interface GenerateEmbedRequest {
  category: string;
  start_date?: string;
  end_date?: string;
}

export interface GrafanaEmbedResponse {
  status: string;
  message: string;
  data: {
    url: string;
  };
}

// --- PERUBAHAN: 'today' menjadi 'daily' ---
export type Period = 'daily' | 'monthly' | 'yearly' | 'custom';

// Tipe untuk state yang disimpan di localStorage
export interface DashboardFilterState {
  period: Period;
  startDate?: string;
  endDate?: string;
}