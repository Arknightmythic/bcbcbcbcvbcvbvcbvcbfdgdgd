

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../api/teamApi";
import type { TeamPayload } from "../utils/types";
import toast from "react-hot-toast";

const QUERY_KEY = "teams";


export const useGetTeams = (params: URLSearchParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params.toString()],
    queryFn: () => getTeams(params),
    placeholderData: (prevData) => prevData,
  });
};


export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TeamPayload) => createTeam(data),
    onSuccess: () => {
      toast.success("tim berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => {
      toast.error("Gagal membuat tim.");
    },
  });
};


export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TeamPayload }) =>
      updateTeam({ id, data }),
    onSuccess: () => {
      toast.success("Tim berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => {
      toast.error("Gagal memperbarui tim.");
    },
  });
};


export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTeam(id),
    onSuccess: () => {
      toast.success("Tim berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => {
      toast.error("Gagal menghapus tim.");
    },
  });
};