// src/features/RoleManagements/utils/types.ts

// Tipe generic untuk semua respons sukses dari backend
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Disesuaikan dengan permission/entity.go
export interface Permission {
  id: number;
  name: string;
}

// Disesuaikan dengan team/entity.go
export interface Team {
  id: number;
  name: string;
  pages: string[];
}

// Disesuaikan dengan role/entity.go (GetRoleDTO)
export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  team: Team;
  // 'description' tidak ada di backend, jadi kita hapus
}

// Payload untuk POST /api/roles dan PUT /api/roles/:id
// Disesuaikan dengan role/entity.go (Struct 'Role')
export interface RolePayload {
  name: string;
  permissions: string[]; // Backend mengharapkan array of string (ID)
  team_id: number;
}

// Tipe data yang dikirim dari modal
export interface RoleModalData {
  name: string;
  teamId: string;
  permissionIds: string[];
  // 'description' dihapus
}

// Disesuaikan dengan response GET /api/roles dari handler
export interface PaginatedRolesResponse {
  roles: Role[];
  total: number;
  limit: number;
  offset: number;
}

// Disesuaikan dengan response GET /api/teams
export interface TeamResponse {
  teams: Team[];
  total: number;
}

export type ActionType = 'view' | 'edit' | 'delete';