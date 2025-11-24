

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
  const LIMIT = 100; // Gunakan limit maksimal backend
  
  // 1. Request halaman pertama
  const firstResponse = await instanceApiToken.get<ApiResponse<{ total: number; [key: string]: any }>>(
    endpoint, 
    { params: { limit: LIMIT, offset: 0 } }
  );

  const totalItems = firstResponse.data.data.total;
  const firstBatchData = dataExtractor(firstResponse.data.data);
  
  // Jika data yang didapat sudah mencakup semua total, kembalikan langsung
  if (totalItems <= LIMIT) {
    return firstBatchData;
  }

  // 2. Hitung sisa halaman yang perlu diambil
  const totalPages = Math.ceil(totalItems / LIMIT);
  const promises = [];

  // Mulai dari page 1 (karena page 0 sudah diambil di atas)
  for (let i = 1; i < totalPages; i++) {
    const offset = i * LIMIT;
    promises.push(
      instanceApiToken.get<ApiResponse<any>>(endpoint, {
        params: { limit: LIMIT, offset: offset },
      })
    );
  }

  // 3. Eksekusi semua request sisa secara paralel
  const remainingResponses = await Promise.all(promises);

  // 4. Gabungkan data
  const remainingData = remainingResponses.flatMap(res => dataExtractor(res.data.data));
  
  return [...firstBatchData, ...remainingData];
}


// GET /api/teams (Modified)
export const getTeams = async (): Promise<Team[]> => {
  return fetchAllData<Team>("/api/teams", (data: any) => data.teams);
};

// GET /api/roles (Modified)
export const getRoles = async (): Promise<Role[]> => {
  return fetchAllData<Role>("/api/roles", (data: any) => data.roles);
};