import { instanceApiToken } from "../../../shared/utils/Axios";


interface PaginationMeta {
  total: number;
  [key: string]: any;
}

interface GenericApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

/**
 * Helper generic untuk mengambil semua data dari endpoint yang berpaginasi
 */
export async function fetchAllData<T>(
  endpoint: string, 
  dataExtractor: (data: any) => T[]
): Promise<T[]> {
  const LIMIT = 100; 
  
  
  const firstResponse = await instanceApiToken.get<GenericApiResponse<PaginationMeta>>(
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
      instanceApiToken.get<GenericApiResponse<any>>(endpoint, {
        params: { limit: LIMIT, offset: offset },
      })
    );
  }

  const remainingResponses = await Promise.all(promises);
  const remainingData = remainingResponses.flatMap(res => dataExtractor(res.data.data));
  
  return [...firstBatchData, ...remainingData];
}