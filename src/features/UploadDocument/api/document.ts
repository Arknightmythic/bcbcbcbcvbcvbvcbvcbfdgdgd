

import { instanceApiToken } from "../../../shared/utils/Axios";
import type { UploadedDocument } from "../types/types";


interface DocumentsPayload {
  documents: UploadedDocument[];
  total: number;
  limit: number;
  offset: number;
}


interface ApiResponse {
    status: string;
    message: string;
    data: DocumentsPayload;
}

interface ViewUrlResponse {
  status: string;
  message: string;
  data: {
    url: string;
  };
}

export const generateViewUrl = async (filename: string) => {
  const response = await instanceApiToken.post<ViewUrlResponse>('/api/documents/generate-view-url', { filename });
  return response.data;
};


export const getDocuments = async (params: URLSearchParams): Promise<DocumentsPayload> => {
  const response = await instanceApiToken.get<ApiResponse>('/api/documents', { params });
  
  return response.data.data;
};


export const uploadDocument = async (formData: FormData) => {
  const response = await instanceApiToken.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


export const updateDocument = async (formData: FormData) => {
  const response = await instanceApiToken.put('/api/documents/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


export const getDocumentDetails = async (documentId: number) => {
  const response = await instanceApiToken.get(`/api/documents/details`, {
    params: { document_id: documentId }
  });
  return response.data;
};


export const deleteDocument = async (documentId: number) => {
  const response = await instanceApiToken.delete(`/api/documents/${documentId}`);
  return response.data;
};

export const batchDeleteDocuments = async (ids: number[]) => {
  // Backend mengharapkan body: { ids: [1, 2, 3] }
  const response = await instanceApiToken.post('/api/documents/batch-delete', { ids });
  return response.data;
};