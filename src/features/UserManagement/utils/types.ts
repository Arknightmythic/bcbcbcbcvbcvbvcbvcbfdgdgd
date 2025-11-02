// src/features/UserManagement/utils/types.ts
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Tipe ini dari backend: team/entity.go
export interface Team {
  id: number;
  name: string;
  pages: string[];
}

// Tipe ini dari backend: permission/entity.go
export interface Permission {
  id: number;
  name: string;
}

// Tipe ini dari backend: role/entity.go (GetRoleDTO)
export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  team: Team;
}

// Tipe ini dari backend: user/enity.go (GetUserDTO)
export interface User {
  id: number;
  name: string;
  email: string;
  account_type: string | null;
  role: Role | null; // Role adalah objek, bukan string
  phone: string | null;
}

// Tipe untuk payload saat membuat user baru (sesuai ekspektasi backend)
export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  account_type: string;
  role_id: number | null;
  phone?: string | null;
}

// Tipe untuk payload saat update user
export interface UpdateUserPayload extends CreateUserPayload {}

// Tipe untuk data dari modal
export interface UserModalData {
  name: string;
  email: string;
  password?: string;
  teamId: string; // Kita tetap pakai string untuk ID dari form
  roleId: string; // Kita tetap pakai string untuk ID dari form
}

// Tipe untuk action di tabel
export type ActionType = 'edit' | 'delete';

// Tipe untuk response paginasi dari backend
export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
}


// Tipe untuk roles (GetRoleDTO)
export interface RoleResponse {
  roles: Role[];
  total: number;
}

// Tipe untuk teams (Team)
export interface TeamResponse {
  teams: Team[];
  total: number;
}