



export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}


export interface Team {
  id: number;
  name: string;
  pages: string[]; 
}


export interface TeamPayload {
  name: string;
  pages: string[];
}


export interface PaginatedTeamsResponse {
  teams: Team[];
  total: number;
  limit: number;
  offset: number;
}

export type ActionType = 'edit' | 'delete';