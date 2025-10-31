
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, approveDocument, rejectDocument } from '../api/document';

export const useGetDocuments = (params: URLSearchParams) => {
  return useQuery({
    queryKey: ['managementDocuments', params.toString()],
    queryFn: () => getDocuments(params),
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