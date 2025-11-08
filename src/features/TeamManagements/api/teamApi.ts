

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  Team,
  TeamPayload,
  PaginatedTeamsResponse,
  ApiResponse,
} from "../utils/types";


export const getTeams = async (
  params: URLSearchParams
): Promise<PaginatedTeamsResponse> => {
  const response = await instanceApiToken.get<ApiResponse<PaginatedTeamsResponse>>(
    "/api/teams",
    { params }
  );
  return response.data.data; 
};


export const createTeam = async (data: TeamPayload): Promise<Team> => {
  const response = await instanceApiToken.post<ApiResponse<Team>>(
    "/api/teams",
    data
  );
  return response.data.data;
};


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


export const deleteTeam = async (id: number): Promise<void> => {
  await instanceApiToken.delete(`/api/teams/${id}`);
};