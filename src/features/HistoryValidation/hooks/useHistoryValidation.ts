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
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename dengan format: type-startdate-enddate
      const filename = generateDownloadFilename(variables.type, variables.startDate, variables.endDate);
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

// Helper function untuk generate nama file
function generateDownloadFilename(type: string, startDate: string, endDate: string): string {
  // Format type untuk filename
  let typeStr: string;
  switch (type) {
    case "all":
      typeStr = "All";
      break;
    case "human-ai":
      typeStr = "Human-AI";
      break;
    case "human-agent":
      typeStr = "Human-Agent";
      break;
    case "ai":
      typeStr = "AI";
      break;
    case "agent":
      typeStr = "Agent";
      break;
    case "human":
      typeStr = "Human";
      break;
    default:
      typeStr = "All";
  }

  // Format tanggal ke DD-MM-YYYY
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  // Build filename
  if (startDateStr && endDateStr) {
    return `${typeStr}-${startDateStr}-${endDateStr}.csv`;
  } else if (startDateStr) {
    return `${typeStr}-${startDateStr}.csv`;
  } else if (endDateStr) {
    return `${typeStr}-${endDateStr}.csv`;
  } else {
    // Jika tidak ada tanggal, gunakan tanggal hari ini
    const today = new Date();
    const todayStr = formatDate(today.toISOString().split('T')[0]);
    return `${typeStr}-${todayStr}.csv`;
  }
}