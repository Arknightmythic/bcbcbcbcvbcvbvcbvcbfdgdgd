// src/features/UserManagement/api/userApi.ts

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  PaginatedUsersResponse,
  CreateUserPayload,
  UpdateUserPayload,
  User,
  Role,
  Team,
  RoleResponse,
  TeamResponse,
  ApiResponse,
} from "../utils/types";

// GET /api/users
export const getUsers = async (
  params: URLSearchParams
): Promise<PaginatedUsersResponse> => {
  const response = await instanceApiToken.get("/api/users/", { params });
  return response.data; // Backend membungkusnya di response.data.data
};

// POST /api/users
export const createUser = async (data: CreateUserPayload): Promise<User> => {
  const response = await instanceApiToken.post("/api/users/", data);
  return response.data.data;
};

// PUT /api/users/:id
export const updateUser = async ({
  id,
  data,
}: {
  id: number;
  data: UpdateUserPayload;
}): Promise<User> => {
  const response = await instanceApiToken.put(`/api/users/${id}`, data);
  return response.data.data;
};

// DELETE /api/users/:id
export const deleteUser = async (id: number): Promise<void> => {
  await instanceApiToken.delete(`/api/users/${id}`);
};

// --- API untuk Modal ---

// GET /api/teams
export const getTeams = async (): Promise<Team[]> => {
  // 1. Gunakan tipe generic ApiResponse<TeamResponse>
  const response = await instanceApiToken.get<ApiResponse<TeamResponse>>(
    "/api/teams"
  );
  // 2. Kembalikan array 'teams' dari dalam 'data'
  return response.data.data.teams;
};

// GET /api/roles
export const getRoles = async (): Promise<Role[]> => {
  // 1. Gunakan tipe generic ApiResponse<RoleResponse>
  const response = await instanceApiToken.get<ApiResponse<RoleResponse>>(
    "/api/roles"
  );
  // 2. Kembalikan array 'roles' dari dalam 'data'
  return response.data.data.roles;
};