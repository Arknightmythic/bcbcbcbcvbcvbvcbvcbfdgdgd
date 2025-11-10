// [PERBAIKAN: src/features/PublicService/api/chatApi.ts]

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  AskPayload,
  AskResponse,
  Conversation,
  ConversationWithPagination,
} from "../utils/types";

/**
 * Mengambil daftar percakapan yang sudah ada.
 */
export const getConversations = async (
  params: URLSearchParams
): Promise<ConversationWithPagination> => {
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
  // --- PERUBAHAN DI SINI ---
  // Tambahkan timeout 90 detik (90000 ms) khusus untuk request ini
  // karena AI membutuhkan waktu lama untuk merespons.
  const response = await instanceApiToken.post("/api/chat/ask", payload, {
    timeout: 90000,
  });
  // --- AKHIR PERUBAHAN ---

  return response.data.data;
};