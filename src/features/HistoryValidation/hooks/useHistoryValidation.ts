// [GANTI: src/features/HistoryValidation/hooks/useHistoryValidation.ts]

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getValidationHistory,
  updateChatFeedback,
  getConversationHistory,
} from "../api/historyApi";
// --- PERBAIKAN: Impor tipe ChatMessage ---
import type { BackendChatHistory, ChatMessage } from "../utils/types";

const QUERY_KEY = "validationHistory";
const HISTORY_KEY = "chatHistoryDetail";

/**
 * Hook untuk mengambil data tabel Validation History
 */
export const useGetValidationHistory = (params: URLSearchParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params.toString()],
    queryFn: () => getValidationHistory(params),
    placeholderData: (prevData) => prevData,
  });
};

/**
 * Hook untuk mutasi Approve/Reject (update feedback)
 */
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback: boolean }) =>
      updateChatFeedback(id, feedback),
    onSuccess: () => {
      // Refresh tabel setelah berhasil
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

/**
 * Hook untuk mengambil data chat history untuk modal.
 * Dibuat 'disabled' by default dan hanya aktif jika 'sessionId' ada.
 */
export const useGetChatHistory = (sessionId: string | null) => {
  return useQuery({
    queryKey: [HISTORY_KEY, sessionId],
    queryFn: () => getConversationHistory(sessionId!),
    enabled: !!sessionId, // Hanya berjalan jika sessionId tidak null
    // --- PERBAIKAN: Tambahkan tipe return eksplisit ---
    select: (data): ChatMessage[] => {
      // Map data backend ke format yang dimengerti UI Modal
      return data.chat_history.map(
        (msg: BackendChatHistory): ChatMessage => ({
          id: msg.id.toString(),
          // Kita map 'assistant' dari BE ke 'agent' di FE
          sender: msg.message.role === "user" ? "user" : "agent",
          text: msg.message.content,
        })
      );
    },
  });
};