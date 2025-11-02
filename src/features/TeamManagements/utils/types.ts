// src/features/TeamManagements/utils/types.ts

// Tipe generic untuk semua respons sukses dari backend
// (Bisa juga diimpor dari shared types jika ada)
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Disesuaikan dengan team/entity.go
export interface Team {
  id: number;
  name: string;
  pages: string[]; // Di frontend lama 'access', di backend 'pages'
}

// Payload untuk POST /api/teams dan PUT /api/teams/:id
export interface TeamPayload {
  name: string;
  pages: string[];
}

// Disesuaikan dengan response GET /api/teams dari handler
export interface PaginatedTeamsResponse {
  teams: Team[];
  total: number;
  limit: number;
  offset: number;
}

export type ActionType = 'edit' | 'delete';