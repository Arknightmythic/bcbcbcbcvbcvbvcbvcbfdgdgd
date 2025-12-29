import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  HelpDesk,
  HelpDeskPayload,
  PaginatedHelpDeskResponse,
  ApiResponse,
  ChatHistoryResponse,
  HelpDeskSwitchStatus,
} from "../utils/types";


export const getHelpDesks = async (
  params: URLSearchParams
): Promise<PaginatedHelpDeskResponse> => {
  const response = await instanceApiToken.get<ApiResponse<PaginatedHelpDeskResponse>>(
    "/api/helpdesk",
    { params }
  );
  return response.data.data;
};

export const getHelpDeskById = async (id: number): Promise<HelpDesk> => {
  const response = await instanceApiToken.get<ApiResponse<HelpDesk>>(
    `/api/helpdesk/${id}`
  );
  return response.data.data;
};

export const getHelpDeskBySessionId = async (
  sessionId: string
): Promise<HelpDesk | null> => {
  try {
    const params = new URLSearchParams();
    params.append("search", sessionId);
    params.append("limit", "1");

    const response = await instanceApiToken.get<ApiResponse<PaginatedHelpDeskResponse>>(
      "/api/helpdesk",
      { params }
    );

    const helpdesks = response.data.data.helpdesks;
    if (helpdesks.length > 0) {
      return helpdesks[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching helpdesk by session_id:", error);
    return null;
  }
};

export const createHelpDesk = async (data: HelpDeskPayload): Promise<HelpDesk> => {
  const response = await instanceApiToken.post<ApiResponse<HelpDesk>>(
    "/api/helpdesk",
    data
  );
  return response.data.data;
};


export const updateHelpDesk = async ({
  id,
  data,
}: {
  id: number;
  data: HelpDeskPayload;
}): Promise<HelpDesk> => {
  const response = await instanceApiToken.put<ApiResponse<HelpDesk>>(
    `/api/helpdesk/${id}`,
    data
  );
  return response.data.data;
};


export const updateHelpDeskStatus = async ({
  id,
  status,
}: {
  id: number;
  status: string;
}): Promise<HelpDesk> => {
  const response = await instanceApiToken.put<ApiResponse<HelpDesk>>(
    `/api/helpdesk/${id}`,
    { status }
  );
  return response.data.data;
};


export const deleteHelpDesk = async (id: number): Promise<void> => {
  await instanceApiToken.delete(`/api/helpdesk/${id}`);
};


export const getAllHelpDesks = async (): Promise<HelpDesk[]> => {
  const LIMIT = 100;
  
  const firstResponse = await instanceApiToken.get<ApiResponse<PaginatedHelpDeskResponse>>(
    "/api/helpdesk",
    { params: { limit: LIMIT, offset: 0 } }
  );

  const totalItems = firstResponse.data.data.total;
  const firstBatchData = firstResponse.data.data.helpdesks;
  
  if (totalItems <= LIMIT) {
    return firstBatchData;
  }

  const totalPages = Math.ceil(totalItems / LIMIT);
  const promises = [];

  for (let i = 1; i < totalPages; i++) {
    const offset = i * LIMIT;
    promises.push(
      instanceApiToken.get<ApiResponse<PaginatedHelpDeskResponse>>("/api/helpdesk", {
        params: { limit: LIMIT, offset: offset },
      })
    );
  }

  const remainingResponses = await Promise.all(promises);
  const remainingData = remainingResponses.flatMap(
    (res) => res.data.data.helpdesks
  );
  
  return [...firstBatchData, ...remainingData];
};


export const getHelpDesksByStatus = async (
  status: string,
  limit: number = 100,
  offset: number = 0
): Promise<PaginatedHelpDeskResponse> => {
  const params = new URLSearchParams();
  params.append("search", status);
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  const response = await instanceApiToken.get<ApiResponse<PaginatedHelpDeskResponse>>(
    "/api/helpdesk",
    { params }
  );
  return response.data.data;
};


export const getChatHistoryBySession = async (
  sessionId: string,
  page: number = 1,
  pageSize: number = 100
): Promise<ChatHistoryResponse> => {
  const response = await instanceApiToken.get<ApiResponse<ChatHistoryResponse>>(
    `/api/chat/history/session/${sessionId}`,
    {
      params: {
        page,
        page_size: pageSize,
        sort_direction: 'DESC',
      },
    }
  );
  return response.data.data;
};

export const sendHelpdeskMessage = async (data: {
  session_id: string;
  message: string;
  user_type: "user" | "agent";
}): Promise<void> => {
  await instanceApiToken.post<ApiResponse<void>>("/api/helpdesk/ask", data);
};

export const solveHelpDeskSession = async (
  sessionId: string, 
  clientTimestamp: string 
): Promise<void> => {
  await instanceApiToken.post<ApiResponse<void>>(
    `/api/helpdesk/solved/${sessionId}`,
    { resolved_at: clientTimestamp } 
  );
};


export const getHelpDeskSwitchStatus = async (): Promise<HelpDeskSwitchStatus> => {
  const response = await instanceApiToken.get<ApiResponse<HelpDeskSwitchStatus>>(
    "/api/helpdesk/switch"
  );
  return response.data.data;
};

export const updateHelpDeskSwitchStatus = async (status: boolean): Promise<HelpDeskSwitchStatus> => {
  const response = await instanceApiToken.post<ApiResponse<HelpDeskSwitchStatus>>(
    "/api/helpdesk/switch",
    { status }
  );
  return response.data.data;
};


export const getHelpDesksInfinite = async ({
  pageParam = 0, 
  queryKey,
}: any): Promise<PaginatedHelpDeskResponse> => {
  // PERBAIKAN DISINI:
  // queryKey strukturnya: ["helpdesks", "infinite", { status, search }]
  // Jadi params ada di index ke-2, bukan ke-1.
  const [_key, _type, params] = queryKey; 
  
  const searchParams = new URLSearchParams();
  searchParams.append("limit", "100"); 
  searchParams.append("offset", pageParam.toString()); 
  
  // Pastikan params ada sebelum akses propertinya
  if (params?.status) searchParams.append("status", params.status);
  if (params?.search) searchParams.append("search", params.search);

  const response = await instanceApiToken.get<ApiResponse<PaginatedHelpDeskResponse>>(
    "/api/helpdesk",
    { params: searchParams }
  );
  return response.data.data;
};