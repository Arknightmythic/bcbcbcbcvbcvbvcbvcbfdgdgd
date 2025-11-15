// [PERBAIKAN: src/features/PublicService/api/chatApi.ts]

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  AskPayload,
  AskResponse,
  Conversation,
  ConversationWithPagination,
} from "../utils/types";

/**
 * Mengambil daftar percakapan yang sudah ada (dengan paginasi).
 */
export const getConversations = async (
  platformUniqueId: string,
  page: number
): Promise<ConversationWithPagination> => {
  // Buat params di dalam fungsi
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("page_size", "10"); // Tetap 10 per halaman
  params.set("platform_unique_id", platformUniqueId);

  const response = await instanceApiToken.get("/api/chat/conversations", {
    params,
  });
  // Data dari backend Anda ada di dalam 'response.data.data'
  return response.data.data;
};

/**
 * Mengambil satu percakapan spesifik beserta riwayat chat-nya.
 */
export const getConversationById = async (
  sessionId: string
): Promise<Conversation> => {
  const response = await instanceApiToken.get(
    `/api/chat/conversations/${sessionId}`
  );
  return response.data.data;
};

/**
 * Mengirim pertanyaan baru (prompt) ke AI.
 * Ini akan membuat percakapan baru jika conversation_id kosong.
 */
export const askQuestion = async (payload: AskPayload): Promise<AskResponse> => {
  const response = await instanceApiToken.post("/api/chat/ask", payload, {
    timeout: 600000,
  });
  return response.data.data;
};