// [BUAT BARU: src/features/HistoryValidation/api/historyApi.ts]

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  PaginatedChatPairsResponse,
  ConversationHistory,
} from "../utils/types";

/**
 * Mengambil data tabel Validation History
 * (GET /api/chat/pairs/all)
 */
export const getValidationHistory = async (
  params: URLSearchParams
): Promise<PaginatedChatPairsResponse> => {
  const response = await instanceApiToken.get("/api/chat/pairs/all", {
    params,
  });
  return response.data.data;
};

/**
 * Memperbarui feedback (Approve/Reject)
 * (PUT /api/chat/history/:id)
 */
export const updateChatFeedback = async (
  id: number,
  feedback: boolean
): Promise<void> => {
  // Kita kirim 'id' dari Answer, dan 'feedback' (true/false)
  const response = await instanceApiToken.put(`/api/chat/history/${id}`, {
    feedback,
  });
  return response.data;
};

/**
 * Mengambil riwayat chat untuk modal
 * (GET /api/chat/conversations/:session_id)
 */
export const getConversationHistory = async (
  sessionId: string
): Promise<ConversationHistory> => {
  const response = await instanceApiToken.get(
    `/api/chat/conversations/${sessionId}`
  );
  return response.data.data;
};