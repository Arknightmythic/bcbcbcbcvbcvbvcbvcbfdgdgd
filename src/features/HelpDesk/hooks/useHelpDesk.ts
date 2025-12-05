import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  getHelpDesks,
  getHelpDeskById,
  getHelpDeskBySessionId,
  createHelpDesk,
  updateHelpDesk,
  updateHelpDeskStatus,
  deleteHelpDesk,
  getAllHelpDesks,
  getHelpDesksByStatus,
  getChatHistoryBySession,
  sendHelpdeskMessage,
  solveHelpDeskSession,
  getHelpDeskSwitchStatus,
  updateHelpDeskSwitchStatus,
} from "../api/helpDeskApi";
import type { HelpDeskPayload, SendHelpdeskMessagePayload } from "../utils/types";
import toast from "react-hot-toast";

const QUERY_KEY = "helpdesks";

/**
 * Hook to get paginated helpdesks
 */
export const useGetHelpDesks = (params: URLSearchParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params.toString()],
    queryFn: () => getHelpDesks(params),
    placeholderData: (prevData) => prevData,
  });
};

/**
 * Hook to get a single helpdesk by ID
 */
export const useGetHelpDeskById = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getHelpDeskById(id),
    enabled: enabled && id > 0,
  });
};

/**
 * Hook to get helpdesk by session_id
 */
export const useGetHelpDeskBySessionId = (
  sessionId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "session", sessionId],
    queryFn: () => getHelpDeskBySessionId(sessionId),
    enabled: enabled && !!sessionId,
  });
};

/**
 * Hook to get all helpdesks (without pagination)
 */
export const useGetAllHelpDesks = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, "all"],
    queryFn: getAllHelpDesks,
    enabled,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data (previously cacheTime in older versions)
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

/**
 * Hook to get helpdesks by status
 */
export const useGetHelpDesksByStatus = (
  status: string,
  limit: number = 100,
  offset: number = 0,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "status", status, limit, offset],
    queryFn: () => getHelpDesksByStatus(status, limit, offset),
    enabled: enabled && !!status,
  });
};

/**
 * Hook to create a new helpdesk
 */
export const useCreateHelpDesk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HelpDeskPayload) => createHelpDesk(data),
    onSuccess: () => {
      toast.success("Tiket bantuan berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal membuat tiket bantuan.");
    },
  });
};

/**
 * Hook to update helpdesk (full update)
 */
export const useUpdateHelpDesk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HelpDeskPayload }) =>
      updateHelpDesk({ id, data }),
    onSuccess: () => {
      toast.success("Tiket bantuan berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "gagal memperbarui tiket bantuan.");
    },
  });
};

/**
 * Hook to update helpdesk status only
 */
export const useUpdateHelpDeskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateHelpDeskStatus({ id, status }),
    onSuccess: () => {
      toast.success("Tiket bantuan berhasil diperbarui statusnya!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Gagal memperbarui status tiket bantuan."
      );
    },
  });
};

/**
 * Hook to delete a helpdesk
 */
export const useDeleteHelpDesk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteHelpDesk(id),
    onSuccess: () => {
      toast.success("Tiket bantuan berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal menghapus tiket bantuan.");
    },
  });
};

/**
 * Hook to accept a chat from queue/pending
 * This updates the status to 'in_progress'
 */
export const useAcceptHelpDesk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) =>
      updateHelpDeskStatus({ id, status: "in_progress" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal menerima tiket bantuan.");
    },
  });
};

/**
 * Hook to resolve a helpdesk
 * This updates the status to 'resolved'
 */
export const useResolveHelpDesk = () => {
  const queryClient = useQueryClient();
  
  // Ubah tipe parameter mutationFn
  return useMutation({
    mutationFn: ({ sessionId, timestamp }: { sessionId: string; timestamp: string }) => 
      solveHelpDeskSession(sessionId, timestamp),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpdesks"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal menyelesaikan percakapan.");
    },
  });
};
/**
 * Hook to get chat history with infinite scroll
 * Fetches older messages as user scrolls up
 */
export const useGetChatHistory = (
  sessionId: string,
  pageSize: number = 50,
  enabled: boolean = true
) => {
  return useInfiniteQuery({
    queryKey: ["chatHistory", sessionId],
    queryFn: ({ pageParam = 1 }) =>
      getChatHistoryBySession(sessionId, pageParam, pageSize),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: enabled && !!sessionId,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: false, // Don't use polling
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Disable refetch on window focus to avoid unnecessary calls
  });
};


/**
 * Hook to send a message in helpdesk chat
 */
export const useSendHelpdeskMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
   mutationFn: (data: SendHelpdeskMessagePayload) => sendHelpdeskMessage(data),
    onSuccess: (_, variables) => {
      // Invalidate chat history to refetch
      queryClient.invalidateQueries({ 
        queryKey: ["chatHistory", variables.session_id] 
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal mengirim pesan.");
    },
  });
};



export const useGetHelpDeskSwitchStatus = () => {
  return useQuery({
    queryKey: ["helpdesk-switch"],
    queryFn: getHelpDeskSwitchStatus,
    staleTime: 0,
  });
};

/**
 * Hook to update helpdesk switch status
 */
export const useUpdateHelpDeskSwitchStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: boolean) => updateHelpDeskSwitchStatus(status),
    onSuccess: (data) => {
      const statusText = data.status ? "AKTIF" : "NON-AKTIF";
      toast.success(`Layanan Helpdesk berhasil diubah menjadi ${statusText}`);
      queryClient.invalidateQueries({ queryKey: ["helpdesk-switch"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal mengubah status layanan helpdesk.");
    },
  });
};

