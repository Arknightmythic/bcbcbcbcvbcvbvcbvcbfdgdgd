import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  PaginatedChatPairsResponse,
  ConversationHistory,
  SortOrder,
  ValidatePayload
} from "../utils/types";

export const getValidationHistory = async (
  baseParams: URLSearchParams, // Ganti nama parameter agar jelas ini base-nya
  sort: SortOrder = "", 
  startDate: string = "", 
  endDate: string = "",
  isValidated?: string, 
  isAnswered?: string   
): Promise<PaginatedChatPairsResponse> => {
  
  // SOLUSI: Clone params agar tidak memutasi object asli dari component
  const params = new URLSearchParams(baseParams);

  // Setup params
  if (sort) {
    params.set("sort_by", "created_at");
    params.set("sort_direction", sort === "latest" ? "desc" : "asc");
  }

  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  // Logika Filter is_validated
  if (isValidated !== undefined && isValidated !== "") {
    params.set("is_validated", isValidated);
  }

  // Logika Filter is_answered
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
  // Menggunakan POST ke /validate sesuai handler.go
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