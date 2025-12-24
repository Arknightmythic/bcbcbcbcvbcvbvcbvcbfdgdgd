

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllTeams,
  getAllPermissions,
} from "../api/roleApi";
import type { RolePayload } from "../utils/types";
import toast from "react-hot-toast";

const QUERY_KEY = "roles";
const TEAMS_KEY = "allTeamsForRoles";
const PERMISSIONS_KEY = "allPermissionsForRoles";


export const useGetRoles = (params: URLSearchParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params.toString()],
    queryFn: () => getRoles(params),
    placeholderData: (prevData) => prevData,
  });
};


export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RolePayload) => createRole(data),
    onSuccess: () => {
      toast.success("Peran berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => {
      toast.error("Gagal membuat peran.");
    },
  });
};


export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RolePayload }) =>
      updateRole({ id, data }),
    onSuccess: () => {
      toast.success("Peran berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => {
      toast.error("Gagal memperbarui peran.");
    },
  });
};


export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      toast.success("Peran berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: () => {
      toast.error("Gagal menghapus peran.");
    },
  });
};



export const useGetModalDependencies = () => {
  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: [TEAMS_KEY],
    queryFn: getAllTeams,
    // staleTime: 1000 * 60 * 5, 
  });

  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: [PERMISSIONS_KEY],
    queryFn: getAllPermissions,
    // staleTime: 1000 * 60 * 5, 
  });

  return {
    teams: teams || [],
    permissions: permissions || [],
    isLoading: isLoadingTeams || isLoadingPermissions,
  };
};