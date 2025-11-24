

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, uploadDocument, updateDocument, getDocumentDetails, deleteDocument, batchDeleteDocuments } from '../api/document'
import toast from 'react-hot-toast';


export const useGetDocuments = (params: URLSearchParams) => {
  return useQuery({
    queryKey: ['documents', params.toString()],
    queryFn: () => getDocuments(params),
  });
};


export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};


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


export const useGetDocumentDetails = (documentId: number | null) => {
    return useQuery({
        queryKey: ['documentDetails', documentId],
        queryFn: () => getDocumentDetails(documentId!),
        enabled: !!documentId, 
    });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete document.");
    },
  });
};


export const useBatchDeleteDocuments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => batchDeleteDocuments(ids),
    onSuccess: () => {
      // Invalidate query agar tabel ter-refresh otomatis
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};