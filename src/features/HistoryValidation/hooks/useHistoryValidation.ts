import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getValidationHistory,
  submitChatValidation,
  getConversationHistory,
} from "../api/historyApi";

import type { BackendChatHistory, ChatMessage, SortOrder, ValidatePayload } from "../utils/types";

const QUERY_KEY = "validationHistory";
const HISTORY_KEY = "chatHistoryDetail";

export const useGetValidationHistory = (
  params: URLSearchParams,
  sort: SortOrder, 
  startDate: string,
  endDate: string,
  // Terima parameter baru
  isValidated?: string,
  isAnswered?: string
) => {
  return useQuery({
    // Tambahkan filter ke queryKey agar data refresh saat filter berubah
    queryKey: [QUERY_KEY, params.toString(), sort, startDate, endDate, isValidated, isAnswered], 
    queryFn: () => getValidationHistory(params, sort, startDate, endDate, isValidated, isAnswered),
    placeholderData: (prevData) => prevData,
  });
};

/**
 * Hook untuk mutasi Validate/Reject/Revise
 */
export const useSubmitValidation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ValidatePayload) => submitChatValidation(payload),
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