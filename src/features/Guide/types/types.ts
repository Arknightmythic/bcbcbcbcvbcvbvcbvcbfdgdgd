// src/features/Guide/types/types.ts

export type SortOrder = 'asc' | 'desc';

export interface Guide {
  id: number;
  title: string;
  description: string;
  filename: string;
  original_filename: string;
  created_at: string;
  updated_at: string;
}

export interface GuideListResponse {
  data: Guide[];
  total: number;
  limit: number;
  offset: number;
}