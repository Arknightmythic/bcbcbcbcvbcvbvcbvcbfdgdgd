// [BUAT BARU: src/features/Dashboard/api/grafanaApi.ts]

import { instanceApiToken } from "../../../shared/utils/Axios";
import type {
  GenerateEmbedRequest,
  GrafanaEmbedResponse,
} from "../utils/types";

/**
 * Meminta URL embed Grafana yang aman dari backend
 * (POST /api/grafana/generate-embed-url)
 */
export const generateGrafanaEmbedUrl = async (
  payload: GenerateEmbedRequest
): Promise<GrafanaEmbedResponse> => {
  const response = await instanceApiToken.post(
    "/api/grafana/generate-embed-url",
    payload
  );
  return response.data;
};