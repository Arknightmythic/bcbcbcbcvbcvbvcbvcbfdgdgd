import { instanceApiToken } from "../../../shared/utils/Axios";
import type { Document } from "../types/types";

interface ApiResponse {
    status: string;
    message: string;  
    data: {
        documents: Document[];
        total: number;
    } | null;
}

interface ApiAllDetailsResponse {
  status: string;
  message: string;  
  data: {
    document_details: Document[]; 
    total: number;
  } | null;
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

export const getDocumentDetails = async (documentId: number) => {
    const response = await instanceApiToken.get(`/api/documents/details`, {
        params: { document_id: documentId }
    });
    
    return response.data.data; 
};

export const approveDocument = async (detailId: number) => {
    const response = await instanceApiToken.put(`/api/documents/approve/${detailId}`);
    return response.data;
};

export const rejectDocument = async (detailId: number) => {
    const response = await instanceApiToken.put(`/api/documents/reject/${detailId}`);
    return response.data;
};


export const getDocuments = async (params: URLSearchParams) => {
    const response = await instanceApiToken.get<ApiResponse>('/api/documents', { params });   
    if (!response.data.data) {
        return { documents: [], total: 0 };
    }
    return response.data.data;
};

export const getAllDocumentDetails = async (params: URLSearchParams) => {
  const response = await instanceApiToken.get<ApiAllDetailsResponse>('/api/documents/all-details', { params });

  if (!response.data.data) {    
    return { documents: [], total: 0 };
  }
  
  return {
    documents: response.data.data.document_details,
    total: response.data.data.total,
  };
};

export const deleteDocument = async (documentId: number) => {
  const response = await instanceApiToken.delete(`/api/documents/${documentId}`);
  return response.data;
};