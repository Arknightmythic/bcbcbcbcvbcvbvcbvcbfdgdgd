// src/features/UploadDocument/hooks/useDocuments.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, uploadDocument, updateDocument, getDocumentDetails } from '../api/document'

// Hook untuk mengambil data dokumen dengan paginasi dan filter
export const useGetDocuments = (params: URLSearchParams) => {
  return useQuery({
    queryKey: ['documents', params.toString()],
    queryFn: () => getDocuments(params),
  });
};

// Hook untuk mutasi (create) dokumen baru
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      // Invalidate query 'documents' agar tabel di-refresh
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

// Hook untuk mutasi (update/versioning) dokumen
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentDetails'] });
    },
  });
};

// Hook untuk mengambil riwayat detail dokumen
export const useGetDocumentDetails = (documentId: number | null) => {
    return useQuery({
        queryKey: ['documentDetails', documentId],
        queryFn: () => getDocumentDetails(documentId!),
        enabled: !!documentId, // Hanya jalankan query jika documentId ada
    });
};