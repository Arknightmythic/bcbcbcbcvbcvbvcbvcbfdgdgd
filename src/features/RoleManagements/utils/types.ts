


export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}


export interface Permission {
  id: number;
  name: string;
}


export interface Team {
  id: number;
  name: string;
  pages: string[];
}


export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  team: Team;
  
}



export interface RolePayload {
  name: string;
  permissions: string[]; 
  team_id: number;
}


export interface RoleModalData {
  name: string;
  teamId: string;
  permissionIds: string[];
  
}


export interface PaginatedRolesResponse {
  roles: Role[];
  total: number;
  limit: number;
  offset: number;
}


export interface TeamResponse {
  teams: Team[];
  total: number;
}

export type ActionType = 'view' | 'edit' | 'delete';