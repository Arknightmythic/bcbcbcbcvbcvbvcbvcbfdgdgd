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