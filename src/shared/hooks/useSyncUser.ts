
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getCurrentUser } from "../../features/Auth/api/authApi";
import { useEffect } from "react";
import type { AxiosError } from "axios";

export const useSyncUser = () => {
  const { isAuthenticated, actions } = useAuthStore();

  const { data: latestUserData, error, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    refetchInterval: 1000 * 15, 
    refetchOnWindowFocus: true,
    retry: false, 
  });

  useEffect(() => {
    if (latestUserData) {


      const currentUserStr = JSON.stringify(useAuthStore.getState().user);
      const newUserStr = JSON.stringify(latestUserData);

      if (currentUserStr !== newUserStr) {
        console.log("🔄 User data/roles updated from server");
        actions.setUser(latestUserData);
      }
    }
  }, [latestUserData, actions]);

  useEffect(() => {
    if (isError && error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      // Jika 404 (User Not Found di DB) atau 401 (Token Invalid/Expired)
      if (status === 404 || status === 401) {
        console.warn("🚫 User tidak valid atau tidak ditemukan. Melakukan logout...");
        actions.logout();
        window.location.href = "/login"; // Redirect paksa ke login
      }
    }
  }, [isError, error, actions]);
};