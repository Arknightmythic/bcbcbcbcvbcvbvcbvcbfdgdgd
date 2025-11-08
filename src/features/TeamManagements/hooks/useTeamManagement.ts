

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
      toast.success("Team created successfully!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create team.");
    },
  });
};


export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TeamPayload }) =>
      updateTeam({ id, data }),
    onSuccess: () => {
      toast.success("Team updated successfully!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update team.");
    },
  });
};


export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTeam(id),
    onSuccess: () => {
      toast.success("Team deleted successfully!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete team.");
    },
  });
};