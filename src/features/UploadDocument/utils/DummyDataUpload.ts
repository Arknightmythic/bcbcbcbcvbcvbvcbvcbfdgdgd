import type { DocumentVersion, UploadedDocument } from "../types/types";

export const DUMMY_UPLOADED_DOCS: UploadedDocument[] = [
    { id: 1, upload_date: '2025-10-27', document_name: 'Panduan Onboarding Karyawan.pdf', document_type: 'PDF', staff: 'Andi Pratama', team: 'HR', status: 'completed', file_path: '/path/to/doc1.pdf', category: 'panduan',version: 2 },
    { id: 2, upload_date: '2025-10-26', document_name: 'Uraian Jabatan Marketing.docx', document_type: 'DOCX', staff: 'Beni Saputra', team: 'Marketing', status: 'completed', file_path: '/path/to/doc2.docx', category: 'uraian', version:1},
    { id: 3, upload_date: '2025-10-25', document_name: 'Peraturan Cuti Tahunan 2025.pdf', document_type: 'PDF', staff: 'Andi Pratama', team: 'HR', status: 'pending', file_path: '/path/to/doc3.pdf', category: 'peraturan', version:1 },
    { id: 4, upload_date: '2025-10-24', document_name: 'Laporan Keuangan Q3.pdf', document_type: 'PDF', staff: 'Citra Kirana', team: 'Finance', status: 'completed', file_path: '/path/to/doc4.pdf', category: 'peraturan', version:1 },
    { id: 5, upload_date: '2025-10-23', document_name: 'Materi Training Sales.docx', document_type: 'DOCX', staff: 'Beni Saputra', team: 'Marketing', status: 'failed', file_path: '/path/to/doc5.docx', category: 'panduan', version:1 },
    { id: 6, upload_date: '2025-10-22', document_name: 'SOP Penanganan Keluhan.pdf', document_type: 'PDF', staff: 'Dedi Hartono', team: 'Support', status: 'completed', file_path: '/path/to/doc6.pdf', category: 'uraian', version:1 },
    { id: 7, upload_date: '2025-10-21', document_name: 'Panduan Penggunaan Aplikasi Internal.pdf', document_type: 'PDF', staff: 'Eka Wijaya', team: 'IT', status: 'completed', file_path: '/path/to/doc7.pdf', category: 'panduan', version:1 },
    { id: 8, upload_date: '2025-10-20', document_name: 'Jadwal Piket Keamanan.docx', document_type: 'DOCX', staff: 'Fajar Nugraha', team: 'Security', status: 'pending', file_path: '/path/to/doc8.docx', category: 'uraian', version:1 },
    { id: 9, upload_date: '2025-10-19', document_name: 'Peraturan Penggunaan Kendaraan Dinas.pdf', document_type: 'PDF', staff: 'Gita Lestari', team: 'GA', status: 'completed', file_path: '/path/to/doc9.pdf', category: 'peraturan', version:1 },
    { id: 10, upload_date: '2025-10-18', document_name: 'Template Presentasi Perusahaan.docx', document_type: 'DOCX', staff: 'Beni Saputra', team: 'Marketing', status: 'completed', file_path: '/path/to/doc10.docx', category: 'panduan', version:1 },
    { id: 11, upload_date: '2025-10-17', document_name: 'Formulir Klaim Asuransi.pdf', document_type: 'PDF', staff: 'Andi Pratama', team: 'HR', status: 'failed', file_path: '/path/to/doc11.pdf', category: 'uraian', version:1 },
];

export const DUMMY_VERSIONS: { [key: number]: DocumentVersion[] } = {
  1: [
    { version: 2, document_name: 'Panduan Onboarding Karyawan v2.pdf', upload_date: '2025-10-27', staff: 'Andi Pratama', file_path: '/path/to/doc1-v2.pdf' },
    { version: 1, document_name: 'Panduan Onboarding Karyawan.pdf', upload_date: '2025-09-15', staff: 'Andi Pratama', file_path: '/path/to/doc1-v1.pdf' },
  ],
  2: [
    { version: 1, document_name: 'Uraian Jabatan Marketing.docx', upload_date: '2025-10-26', staff: 'Beni Saputra', file_path: '/path/to/doc2.docx' },
  ]
};