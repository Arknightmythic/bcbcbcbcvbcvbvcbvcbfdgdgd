

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


export type Period = 'daily' | 'monthly' | 'yearly' | 'custom';


export interface DashboardFilterState {
  period: Period;
  startDate?: string;
  endDate?: string;
}