// src/features/HistoryValidation/hooks/useHistoryValidation.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getValidationHistory,
  submitChatValidation,
  getConversationHistory,
  downloadChatHistory,
} from "../api/historyApi";

import type { BackendChatHistory, ChatMessage, SortOrder, ValidatePayload } from "../utils/types";

const QUERY_KEY = "validationHistory";
const HISTORY_KEY = "chatHistoryDetail";

export const useGetValidationHistory = (
  params: URLSearchParams,
  sort: SortOrder, 
  startDate: string,
  endDate: string,
  isValidated?: string,
  isAnswered?: string
) => {
  return useQuery({
    queryKey: [QUERY_KEY, params.toString(), sort, startDate, endDate, isValidated, isAnswered], 
    queryFn: () => getValidationHistory(params, sort, startDate, endDate, isValidated, isAnswered),
    placeholderData: (prevData) => prevData,
  });
};

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

// NEW: Hook untuk download chat history
export const useDownloadChatHistory = () => {
  return useMutation({
    mutationFn: ({ startDate, endDate, type }: { startDate: string; endDate: string; type: string }) => 
      downloadChatHistory(startDate, endDate, type),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `chat_history_${timestamp}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};