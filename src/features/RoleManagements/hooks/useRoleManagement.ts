

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
      toast.success("Role created successfully!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create role.");
    },
  });
};


export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RolePayload }) =>
      updateRole({ id, data }),
    onSuccess: () => {
      toast.success("Role updated successfully!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update role.");
    },
  });
};


export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      toast.success("Role deleted successfully!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete role.");
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