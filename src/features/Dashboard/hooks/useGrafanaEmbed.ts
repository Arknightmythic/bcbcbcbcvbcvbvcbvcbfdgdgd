// [BUAT BARU: src/features/Dashboard/hooks/useGrafanaEmbed.ts]

import { useMutation } from "@tanstack/react-query";
import { generateGrafanaEmbedUrl } from "../api/grafanaApi";
import type { GenerateEmbedRequest } from "../utils/types";

export const useGenerateGrafanaUrl = () => {
  return useMutation({
    mutationFn: (payload: GenerateEmbedRequest) =>
      generateGrafanaEmbedUrl(payload),
    // Kita tidak perlu onSuccess atau onError di sini,
    // komponen yang akan menanganinya.
  });
};