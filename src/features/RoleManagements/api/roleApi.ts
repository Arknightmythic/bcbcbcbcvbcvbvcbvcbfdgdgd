// src/features/RoleManagements/api/roleApi.ts

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  Role,
  Team,
  Permission,
  RolePayload,
  PaginatedRolesResponse,
  TeamResponse,
  ApiResponse,
} from "../utils/types";

// --- ROLE API ---

// GET /api/roles
export const getRoles = async (
  params: URLSearchParams
): Promise<PaginatedRolesResponse> => {
  const response = await instanceApiToken.get<ApiResponse<PaginatedRolesResponse>>(
    "/api/roles",
    { params }
  );
  return response.data.data;
};

// POST /api/roles
export const createRole = async (data: RolePayload): Promise<Role> => {
  const response = await instanceApiToken.post<ApiResponse<Role>>(
    "/api/roles",
    data
  );
  return response.data.data;
};

// PUT /api/roles/:id
export const updateRole = async ({
  id,
  data,
}: {
  id: number;
  data: RolePayload;
}): Promise<Role> => {
  const response = await instanceApiToken.put<ApiResponse<Role>>(
    `/api/roles/${id}`,
    data
  );
  return response.data.data;
};

// DELETE /api/roles/:id
export const deleteRole = async (id: number): Promise<void> => {
  await instanceApiToken.delete(`/api/roles/${id}`);
};

// --- DEPENDENCY API (Untuk Modal) ---

// GET /api/teams (kita ambil semua, asumsikan 1000 cukup)
export const getAllTeams = async (): Promise<Team[]> => {
  const params = new URLSearchParams();
  params.set("limit", "1000"); 
  params.set("offset", "0");
  const response = await instanceApiToken.get<ApiResponse<TeamResponse>>(
    "/api/teams",
    { params }
  );
  return response.data.data.teams;
};

// GET /api/permissions
export const getAllPermissions = async (): Promise<Permission[]> => {
  // Endpoint ini (dari permission/handler.go) tidak dipaginasi
  const response = await instanceApiToken.get<ApiResponse<Permission[]>>(
    "/api/permissions"
  );
  return response.data.data;
};