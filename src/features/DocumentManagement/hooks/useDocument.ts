
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approveDocument, rejectDocument, getAllDocumentDetails, deleteDocument } from '../api/document';

export const useGetDocuments = (params: URLSearchParams) => {
  return useQuery({
    queryKey: ['managementDocuments', params.toString()],
    queryFn: () => getAllDocumentDetails(params), // <-- UBAH FUNGSI DI SINI
  });
};

export const useApproveDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveDocument,
        onSuccess: () => {
            // Refresh data di tabel setelah berhasil
            queryClient.invalidateQueries({ queryKey: ['managementDocuments'] });
        },
    });
};

export const useRejectDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rejectDocument,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managementDocuments'] });
        },
    });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      // Tidak perlu toast di sini, akan ditangani di page
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      // Biarkan page menangani error toast
      console.error(err);
    },
  });
};

