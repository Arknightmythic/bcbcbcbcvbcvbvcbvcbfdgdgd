import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  PaginatedChatPairsResponse,
  ConversationHistory,
  SortOrder
} from "../utils/types";

export const getValidationHistory = async (
  params: URLSearchParams,
  sort: SortOrder = "", 
  startDate: string = "", // Ubah date -> startDate
  endDate: string = ""    // Tambah endDate
): Promise<PaginatedChatPairsResponse> => {
  if (sort) {
    params.set("sort", sort); 
  }
  // Kirim start_date dan end_date ke Backend
  if (startDate) {
    params.set("start_date", startDate); 
  }
  if (endDate) {
    params.set("end_date", endDate);
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


export const getConversationHistory = async (
  sessionId: string
): Promise<ConversationHistory> => {
  const response = await instanceApiToken.get(
    `/api/chat/conversations/${sessionId}`
  );
  return response.data.data;
};