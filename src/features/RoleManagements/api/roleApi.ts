

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




export const getRoles = async (
  params: URLSearchParams
): Promise<PaginatedRolesResponse> => {
  const response = await instanceApiToken.get<ApiResponse<PaginatedRolesResponse>>(
    "/api/roles",
    { params }
  );
  return response.data.data;
};


export const createRole = async (data: RolePayload): Promise<Role> => {
  const response = await instanceApiToken.post<ApiResponse<Role>>(
    "/api/roles",
    data
  );
  return response.data.data;
};


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


export const deleteRole = async (id: number): Promise<void> => {
  await instanceApiToken.delete(`/api/roles/${id}`);
};




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


export const getAllPermissions = async (): Promise<Permission[]> => {
  
  const response = await instanceApiToken.get<ApiResponse<Permission[]>>(
    "/api/permissions"
  );
  return response.data.data;
};