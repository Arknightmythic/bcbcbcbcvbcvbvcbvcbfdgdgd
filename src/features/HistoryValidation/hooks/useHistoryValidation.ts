import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getValidationHistory,
  updateChatFeedback,
  getConversationHistory,
} from "../api/historyApi";

import type { BackendChatHistory, ChatMessage, SortOrder } from "../utils/types";

const QUERY_KEY = "validationHistory";
const HISTORY_KEY = "chatHistoryDetail";

interface FeedbackPayload {
  id: number;
  feedback: boolean;
  correction?: string;
}

/**
 * Hook untuk mengambil data tabel Validation History
 */
export const useGetValidationHistory = (
  params: URLSearchParams,
  sort: SortOrder, 
  startDate: string, // Ganti date -> startDate
  endDate: string    // Tambah endDate
) => {
  return useQuery({
    // Masukkan kedua tanggal ke queryKey agar refetch saat berubah
    queryKey: [QUERY_KEY, params.toString(), sort, startDate, endDate], 
    
    queryFn: () => getValidationHistory(params, sort, startDate, endDate),
    placeholderData: (prevData) => prevData,
  });
};

/**
 * Hook untuk mutasi Approve/Reject (update feedback)
 */
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback, correction }: FeedbackPayload) =>
    updateChatFeedback(id, feedback, correction),
    onSuccess: () => {  
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useGetChatHistory = (sessionId: string | null) => {
  return useQuery({
    queryKey: [HISTORY_KEY, sessionId],
    queryFn: () => getConversationHistory(sessionId!),
    enabled: !!sessionId, 
    select: (data): ChatMessage[] => {
      return data.chat_history.map(
        (msg: BackendChatHistory): ChatMessage => ({
          id: msg.id.toString(),
          sender: msg.message.role === "user" ? "user" : "agent",
          text: msg.message.content,
        })
      );
    },
  });
};