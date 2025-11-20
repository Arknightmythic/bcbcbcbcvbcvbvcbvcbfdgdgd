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
  date: string 
) => {
  return useQuery({
    queryKey: [QUERY_KEY, params.toString(), sort, date], 
    
    queryFn: () => getValidationHistory(params, sort, date),
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
/**
 * Hook untuk mengambil data chat history untuk modal.
 * Dibuat 'disabled' by default dan hanya aktif jika 'sessionId' ada.
 */
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
