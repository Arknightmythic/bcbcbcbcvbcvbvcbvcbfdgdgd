import { useMutation } from "@tanstack/react-query";
import { generateGrafanaEmbedUrl } from "../api/grafanaApi";
import type { GenerateEmbedRequest } from "../utils/types";

export const useGenerateGrafanaUrl = () => {
  return useMutation({
    mutationFn: (payload: GenerateEmbedRequest) =>
      generateGrafanaEmbedUrl(payload),
  });
};