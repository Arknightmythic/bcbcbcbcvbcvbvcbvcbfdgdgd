import { instanceApiToken } from "../../../shared/utils/Axios";
import type { GuideListResponse } from "../types/types";

interface ApiResponse {
  status: string;
  message: string;
  data: GuideListResponse;
}

interface ViewUrlResponse {
  status: string;
  message: string;
  data: {
    url: string;
  };
}

export const getGuides = async (params: URLSearchParams): Promise<GuideListResponse> => {
  const response = await instanceApiToken.get<ApiResponse>('/api/guides', { params });
  return response.data.data;
};

export const generateGuideViewUrl = async (id: number) => {
  // Endpoint ini sesuai dengan route backend: guideGroup.POST("/generate-view-url", handler.GenerateViewURL)
  const response = await instanceApiToken.post<ViewUrlResponse>('/api/guides/generate-view-url', { id });
  return response.data;
};