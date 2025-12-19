// src/features/DocumentManagement/api/documents.ts

import { instanceApiToken } from "../../../shared/utils/Axios";
import type { Document } from "../types/types";

interface ApiResponse {
    status: string;
    message: string;
    // PERUBAHAN 1: data sekarang bisa null
    data: {
        documents: Document[];
        total: number;
    } | null;
}

// Tipe ApiResponseBaru (untuk endpoint baru)
interface ApiAllDetailsResponse {
  status: string;
  message: string;
  // PERUBAHAN 2: data sekarang bisa null
  data: {
    document_details: Document[]; // Tipe Document kita sudah cocok
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

// Fungsi getDocuments
export const getDocuments = async (params: URLSearchParams) => {
    const response = await instanceApiToken.get<ApiResponse>('/api/documents', { params });

    // PERUBAHAN 3: Menangani jika response.data.data adalah null
    if (!response.data.data) {
        // Kembalikan struktur data kosong agar sesuai dengan tipe yang diharapkan
        return { documents: [], total: 0 };
    }
    
    return response.data.data;
};

export const getAllDocumentDetails = async (params: URLSearchParams) => {
  // Params ini otomatis membawa request_type jika di-set di UploadPage/ManagementPage
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