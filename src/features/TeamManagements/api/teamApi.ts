// src/features/TeamManagements/api/teamApi.ts

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  Team,
  TeamPayload,
  PaginatedTeamsResponse,
  ApiResponse,
} from "../utils/types";

// GET /api/teams
export const getTeams = async (
  params: URLSearchParams
): Promise<PaginatedTeamsResponse> => {
  const response = await instanceApiToken.get<ApiResponse<PaginatedTeamsResponse>>(
    "/api/teams",
    { params }
  );
  return response.data.data; // Sesuai struktur { data: { teams: [...] } }
};

// POST /api/teams
export const createTeam = async (data: TeamPayload): Promise<Team> => {
  const response = await instanceApiToken.post<ApiResponse<Team>>(
    "/api/teams",
    data
  );
  return response.data.data;
};

// PUT /api/teams/:id
export const updateTeam = async ({
  id,
  data,
}: {
  id: number;
  data: TeamPayload;
}): Promise<Team> => {
  const response = await instanceApiToken.put<ApiResponse<Team>>(
    `/api/teams/${id}`,
    data
  );
  return response.data.data;
};

// DELETE /api/teams/:id
export const deleteTeam = async (id: number): Promise<void> => {
  await instanceApiToken.delete(`/api/teams/${id}`);
};