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

  if (!response.data.data) {
      return {
          data: [],
          total: 0,
          page: page,
          page_size: 10,
          total_pages: 0
      };
  }
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


export const sendFeedback = async (answerId: number, feedback: boolean): Promise<void> => {
  // Sesuai endpoint backend /api/chat/feedback
  await instanceApiToken.post("/api/chat/feedback", {
    answer_id: answerId,
    feedback: feedback
  });
};

/**
 * Generate URL untuk melihat file PDF berdasarkan ID dokumen
 */
export const generateViewUrl = async (id: number): Promise<string> => {
  // Sesuai endpoint backend dokumen handler: GenerateViewURLByID
  const response = await instanceApiToken.post("/api/documents/generate-view-url-id", {
    id: id
  });
  return response.data.data.url;
};