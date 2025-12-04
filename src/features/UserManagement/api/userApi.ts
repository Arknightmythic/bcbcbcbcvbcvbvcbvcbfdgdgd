

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  PaginatedUsersResponse,
  CreateUserPayload,
  UpdateUserPayload,
  User,
  Role,
  Team,
  ApiResponse,
} from "../utils/types";


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


async function fetchAllData<T>(
  endpoint: string, 
  dataExtractor: (data: any) => T[]
): Promise<T[]> {
  const LIMIT = 100; 
  
  
  const firstResponse = await instanceApiToken.get<ApiResponse<{ total: number; [key: string]: any }>>(
    endpoint, 
    { params: { limit: LIMIT, offset: 0 } }
  );

  const totalItems = firstResponse.data.data.total;
  const firstBatchData = dataExtractor(firstResponse.data.data);
  
  
  if (totalItems <= LIMIT) {
    return firstBatchData;
  }

  
  const totalPages = Math.ceil(totalItems / LIMIT);
  const promises = [];

  
  for (let i = 1; i < totalPages; i++) {
    const offset = i * LIMIT;
    promises.push(
      instanceApiToken.get<ApiResponse<any>>(endpoint, {
        params: { limit: LIMIT, offset: offset },
      })
    );
  }

  
  const remainingResponses = await Promise.all(promises);

  
  const remainingData = remainingResponses.flatMap(res => dataExtractor(res.data.data));
  
  return [...firstBatchData, ...remainingData];
}



export const getTeams = async (): Promise<Team[]> => {
  return fetchAllData<Team>("/api/teams", (data: any) => data.teams);
};


export const getRoles = async (): Promise<Role[]> => {
  return fetchAllData<Role>("/api/roles", (data: any) => data.roles);
};