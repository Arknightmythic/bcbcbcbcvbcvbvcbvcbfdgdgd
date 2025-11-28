// src/features/UserManagement/hooks/useUserManagement.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getTeams,
  getRoles,
} from "../api/userApi";
import type { CreateUserPayload, UpdateUserPayload } from "../utils/types";
import toast from "react-hot-toast";

const QUERY_KEY = "users";
const TEAMS_KEY = "teams";
const ROLES_KEY = "roles";

// Hook untuk mengambil data user (paginasi)
export const useGetUsers = (params: URLSearchParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params.toString()],
    queryFn: () => getUsers(params),
    placeholderData: (prevData) => prevData, // Menjaga data lama saat loading
  });
};

// Hook untuk membuat user baru
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => createUser(data),
    onSuccess: () => {
      toast.success("Akun berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Akun gagal dibuat.");
    },
  });
};

// Hook untuk update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      updateUser({ id, data }),
    onSuccess: () => {
      toast.success("AKun berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal memperbarui akun.");
    },
  });
};

// Hook untuk delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      toast.success("Akun berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "gagal menghapus akun.");
    },
  });
};

// --- Hook untuk Data Modal ---

// Hook untuk mengambil data Teams
export const useGetTeams = () => {
  return useQuery({
    queryKey: [TEAMS_KEY],
    queryFn: getTeams,
    // staleTime: 1000 * 60 * 5, // Cache selama 5 menit
  });
};

// Hook untuk mengambil data Roles
export const useGetRoles = () => {
  return useQuery({
    queryKey: [ROLES_KEY],
    queryFn: getRoles,
    // staleTime: 1000 * 60 * 5, // Cache selama 5 menit
  });
};