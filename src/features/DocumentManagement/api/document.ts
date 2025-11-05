// src/features/DocumentManagement/api/documents.ts

import { instanceApiToken } from "../../../shared/utils/Axios";
import type { Document } from "../types/types";

interface ApiResponse {
    status: string;
    message: string;
    data: {
        documents: Document[];
        total: number;
    };
}

// Tipe ApiResponseBaru (untuk endpoint baru)
interface ApiAllDetailsResponse {
  status: string;
  message: string;
  data: {
    document_details: Document[]; // Tipe Document kita sudah cocok
    total: number;
  };
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

// Fungsi untuk mengambil detail untuk mendapatkan detail_id
export const getDocumentDetails = async (documentId: number) => {
    const response = await instanceApiToken.get(`/api/documents/details`, {
        params: { document_id: documentId }
    });
    // Mengembalikan array dari detail
    return response.data.data; 
};

// Fungsi untuk menyetujui dokumen
export const approveDocument = async (detailId: number) => {
    const response = await instanceApiToken.put(`/api/documents/approve/${detailId}`);
    return response.data;
};

// Fungsi untuk menolak dokumen
export const rejectDocument = async (detailId: number) => {
    const response = await instanceApiToken.put(`/api/documents/reject/${detailId}`);
    return response.data;
};

// Fungsi getDocuments (tetap sama)
export const getDocuments = async (params: URLSearchParams) => {
    const response = await instanceApiToken.get<ApiResponse>('/api/documents', { params });
    return response.data.data;
};

export const getAllDocumentDetails = async (params: URLSearchParams) => {
  const response = await instanceApiToken.get<ApiAllDetailsResponse>('/api/documents/all-details', { params });
  // Kembalikan data dengan format yang sama seperti getDocuments
  return {
    documents: response.data.data.document_details,
    total: response.data.data.total,
  };
};