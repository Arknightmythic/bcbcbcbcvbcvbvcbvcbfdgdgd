// src/features/HistoryValidation/api/historyApi.ts

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  PaginatedChatPairsResponse,
  ConversationHistory,
  SortOrder,
  ValidatePayload
} from "../utils/types";

export const getValidationHistory = async (
  baseParams: URLSearchParams,
  sort: SortOrder = "", 
  startDate: string = "", 
  endDate: string = "",
  isValidated?: string, 
  isAnswered?: string   
): Promise<PaginatedChatPairsResponse> => {
  
  const params = new URLSearchParams(baseParams);

  if (sort) {
    params.set("sort_by", "created_at");
    params.set("sort_direction", sort === "latest" ? "desc" : "asc");
  }

  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  if (isValidated !== undefined && isValidated !== "") {
    params.set("is_validated", isValidated);
  }

  if (isAnswered !== undefined && isAnswered !== "") {
    params.set("is_answered", isAnswered);
  }

  const response = await instanceApiToken.get("/api/chat/pairs/all", {
    params,
  });
  return response.data.data;
};

export const updateChatFeedback = async (
  id: number,
  feedback: boolean, 
  correction?: string 
): Promise<void> => {
  const payload: { feedback: boolean; correct_answer?: string } = {
    feedback,
  };

  if (feedback && correction && correction.trim() !== "") {
    payload.correct_answer = correction.trim();
  }

  const response = await instanceApiToken.put(`/api/chat/history/${id}`, payload);
  return response.data;
};

export const submitChatValidation = async (
  payload: ValidatePayload
): Promise<void> => {
  const response = await instanceApiToken.post("/api/chat/validate", payload);
  return response.data;
};

export const getConversationHistory = async (
  sessionId: string
): Promise<ConversationHistory> => {
  const response = await instanceApiToken.get(
    `/api/chat/conversations/${sessionId}`
  );
  return response.data.data;
};

// NEW: Function untuk download chat history
export const downloadChatHistory = async (
  startDate: string,
  endDate: string,
  type: string
): Promise<Blob> => {
  const params = new URLSearchParams();
  
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  if (type) params.set("type", type);

  const response = await instanceApiToken.get("/api/chat/history/download", {
    params,
    responseType: 'blob', // Important untuk download file
  });
  
  return response.data;
};