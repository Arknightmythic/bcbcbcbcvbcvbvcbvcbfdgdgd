// src/features/UploadDocument/api/documents.ts

import { instanceApiToken } from "../../../shared/utils/Axios";
import type { UploadedDocument } from "../types/types";

// Definisikan tipe untuk isi dari properti 'data'
interface DocumentsPayload {
  documents: UploadedDocument[];
  total: number;
  limit: number;
  offset: number;
}

// Definisikan tipe untuk seluruh respons API
interface ApiResponse {
    status: string;
    message: string;
    data: DocumentsPayload;
}

// Fungsi untuk mengambil daftar dokumen
export const getDocuments = async (params: URLSearchParams): Promise<DocumentsPayload> => {
  const response = await instanceApiToken.get<ApiResponse>('/api/documents', { params });
  // Perubahan di sini: kembalikan object di dalam properti 'data'
  return response.data.data;
};

// Fungsi untuk mengunggah dokumen baru
export const uploadDocument = async (formData: FormData) => {
  const response = await instanceApiToken.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Fungsi untuk mengunggah versi baru dari dokumen yang sudah ada
export const updateDocument = async (formData: FormData) => {
  const response = await instanceApiToken.put('/api/documents/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Fungsi untuk mendapatkan riwayat versi sebuah dokumen
export const getDocumentDetails = async (documentId: number) => {
  const response = await instanceApiToken.get(`/api/documents/details`, {
    params: { document_id: documentId }
  });
  return response.data;
};