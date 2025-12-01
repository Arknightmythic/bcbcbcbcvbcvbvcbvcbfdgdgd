// src/features/Auth/api/authApi.ts
import { instanceApiToken } from "../../../shared/utils/Axios";
import type { ApiResponse } from "../../UserManagement/utils/types";
 // Sesuaikan path types

export const getCurrentUser = async () => {
  // Endpoint ini sudah ada di user/route.go -> userGroup.GET("/me", ...)
  const response = await instanceApiToken.get<ApiResponse<any>>("/api/users/me");
  return response.data.data;
};