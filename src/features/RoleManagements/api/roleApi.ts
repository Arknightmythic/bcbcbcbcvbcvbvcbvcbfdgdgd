import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  Role,
  Team,
  Permission,
  RolePayload,
  PaginatedRolesResponse,
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



async function fetchAllData<T>(
  endpoint: string, 
  dataExtractor: (data: any) => T[]
): Promise<T[]> {
  const LIMIT = 100; // Sesuaikan dengan limit backend
  
  // 1. Request batch pertama
  const firstResponse = await instanceApiToken.get<ApiResponse<{ total: number; [key: string]: any }>>(
    endpoint, 
    { params: { limit: LIMIT, offset: 0 } }
  );

  const totalItems = firstResponse.data.data.total;
  const firstBatchData = dataExtractor(firstResponse.data.data);
  
  // Jika total data <= limit, langsung return
  if (totalItems <= LIMIT) {
    return firstBatchData;
  }

  // 2. Hitung sisa halaman
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

  // 3. Request paralel sisanya
  const remainingResponses = await Promise.all(promises);

  // 4. Gabungkan data
  const remainingData = remainingResponses.flatMap(res => dataExtractor(res.data.data));
  
  return [...firstBatchData, ...remainingData];
}

// PERBAIKAN DI SINI: Gunakan fetchAllData untuk Teams
export const getAllTeams = async (): Promise<Team[]> => {
  return fetchAllData<Team>("/api/teams", (data: any) => data.teams);
};


export const getAllPermissions = async (): Promise<Permission[]> => {
  
  const response = await instanceApiToken.get<ApiResponse<Permission[]>>(
    "/api/permissions"
  );
  return response.data.data;
};