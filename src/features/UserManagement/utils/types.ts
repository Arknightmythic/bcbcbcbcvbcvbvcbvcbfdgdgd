
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


export interface Permission {
  id: number;
  name: string;
}


export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  team: Team;
}


export interface User {
  id: number;
  name: string;
  email: string;
  account_type: string | null;
  role: Role | null; 
  phone: string | null;
}


export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  account_type: string;
  role_id: number | null;
  phone?: string | null;
}


export interface UpdateUserPayload extends CreateUserPayload {}


export interface UserModalData {
  name: string;
  email: string;
  password?: string;
  teamId: string; 
  roleId: string; 
}


export type ActionType = 'edit' | 'delete';


export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
}



export interface RoleResponse {
  roles: Role[];
  total: number;
}


export interface TeamResponse {
  teams: Team[];
  total: number;
}