// Path: src/features/UserManagement/api/userApi.ts (Sesuaikan path-nya)

import { instanceApiToken } from "../../../shared/utils/Axios";

import type {
  PaginatedUsersResponse,
  CreateUserPayload,
  UpdateUserPayload,
  User,
  Role,
  Team,
} from "../utils/types";
import { fetchAllData } from "./apiHelpers";

export const getUsers = async (
  params: URLSearchParams
): Promise<PaginatedUsersResponse> => {
  const response = await instanceApiToken.get("/api/users/", { params });
  return response.data; 
};

export const createUser = async (data: CreateUserPayload): Promise<User> => {
  const response = await instanceApiToken.post("/api/users/", data);
  return response.data.data;
};

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

export const deleteUser = async (id: number): Promise<void> => {
  await instanceApiToken.delete(`/api/users/${id}`);
};


export const getTeams = async (): Promise<Team[]> => {
  return fetchAllData<Team>("/api/teams", (data: any) => data.teams);
};

export const getRoles = async (): Promise<Role[]> => {
  return fetchAllData<Role>("/api/roles", (data: any) => data.roles);
};