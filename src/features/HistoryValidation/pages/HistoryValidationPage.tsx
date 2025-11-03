// [File: src/features/HistoryValidation/pages/HistoryValidationPage.tsx]

import { useMemo, useState } from "react";
import type {
  ActionType,
  // ValidationHistory, // <-- Hapus
  ValidationHistoryItem, // <-- Ganti
  ChatMessage,
} from "../utils/types";
import HistoryValidationTable from "../components/HistoryValidationTable";
import ChatHistoryModal from "../components/ChatHistoryModal";
import TableControls, {
  type FilterConfig,
} from "../../../shared/components/TableControls";
import toast from "react-hot-toast"; // <-- Impor toast
import TextExpandModal from "../../../shared/components/TextExpandModal";

// Ganti interface Filters
export interface Filters {
  aiAnswer: string;
  validationStatus: string;
}

// Ganti filterConfig
const filterConfig: FilterConfig<Filters>[] = [
  {
    key: "aiAnswer",
    options: [
      { value: "", label: "Semua Jawaban AI" },
      { value: "answered", label: "Terjawab" },
      { value: "unanswered", label: "Tidak Terjawab" },
    ],
  },
  {
    key: "validationStatus",
    options: [
      { value: "", label: "Semua Status Validasi" },
      { value: "Pending", label: "Pending" },
      { value: "Validated", label: "Validated" },
      { value: "Not Validated", label: "Not Validated" },
    ],
  },
];

// Ganti DUMMY_HISTORY
const DUMMY_HISTORY: ValidationHistoryItem[] = [
  {
    id: 1,
    tanggal: "2025-10-29T10:00:00Z",
    user: "Ani Susanti",
    session_id: "sess_90123",
    pertanyaan: "Bagaimana prosedur terbaru untuk pengajuan izin investasi sektor energi terbarukan?",
    jawaban_ai: "Prosedur terbaru melibatkan sistem OSS RBA dan memerlukan dokumen studi kelayakan proyek.",
    tidak_terjawab: false,
    status_validasi: "Pending",
  },
  {
    id: 2,
    tanggal: "2025-10-28T11:30:00Z",
    user: "Bambang Wijaya",
    session_id: "sess_45678",
    pertanyaan: "Apa saja insentif pajak yang tersedia untuk investasi di Kawasan Ekonomi Khusus (KEK)?",
    jawaban_ai: "Insentifnya meliputi tax holiday, pengurangan PPh Badan, dan pembebasan PPN/PPnBM tertentu.",
    tidak_terjawab: false,
    status_validasi: "Validated",
  },
  {
    id: 3,
    tanggal: "2025-10-27T14:15:00Z",
    user: "Citra Dewi",
    session_id: "sess_11223",
    pertanyaan: "Berapa batas minimal modal untuk PMA di sektor pertambangan mineral?",
    jawaban_ai: "Batas minimal modal untuk PMA adalah Rp 10 Miliar. (Jawaban ini salah, batasnya lebih tinggi)",
    tidak_terjawab: false,
    status_validasi: "Not Validated",
  },
  {
    id: 4,
    tanggal: "2025-10-26T09:05:00Z",
    user: "Dedi Firmansyah",
    session_id: "sess_55667",
    pertanyaan: "Bagaimana cara mendaftar sebagai mitra hilirisasi di BKPM?",
    jawaban_ai: "Pendaftaran dapat dilakukan melalui portal layanan perizinan terpadu dengan mengisi formulir mitra.",
    tidak_terjawab: false,
    status_validasi: "Pending",
  },
  {
    id: 5,
    tanggal: "2025-10-25T16:45:00Z",
    user: "Eko Prasetyo",
    session_id: "sess_77889",
    pertanyaan: "Apa kebijakan fiskal terbaru yang akan diimplementasikan pada kuartal depan?",
    jawaban_ai: "Maaf, saya tidak dapat menemukan informasi relevan saat ini.",
    tidak_terjawab: true,
    status_validasi: "Pending",
  },
  {
      id: 6,
      tanggal: "2025-10-24T10:00:00Z",
      user: "Budi Santoso",
      session_id: "sess_10001",
      pertanyaan: "Saya ingin menanyakan tentang regulasi terbaru mengenai standar emisi kendaraan bermotor untuk kendaraan listrik di Indonesia. Apakah ada perubahan signifikan dalam beberapa tahun terakhir dan bagaimana dampaknya terhadap produsen mobil yang ingin berinvestasi di pasar Indonesia? Mohon berikan informasi detail mengenai ambang batas emisi, proses sertifikasi, dan insentif yang diberikan pemerintah untuk adopsi kendaraan rendah emisi. Saya juga tertarik dengan perbandingan regulasi ini dengan negara-negara maju seperti Jepang atau Eropa.",
      jawaban_ai: "Regulasi emisi kendaraan bermotor di Indonesia untuk kendaraan listrik saat ini masih dalam tahap pengembangan yang cepat. Pemerintah telah mengeluarkan beberapa kebijakan untuk mendorong penggunaan kendaraan listrik, termasuk insentif pajak dan pembebasan bea masuk untuk komponen tertentu. Perubahan signifikan terjadi pada Peraturan Menteri Perindustrian No. XX Tahun 2023 yang memperkenalkan standar EURO 4 untuk kendaraan ICE baru dan kerangka kerja awal untuk kendaraan listrik. Proses sertifikasi melibatkan uji tipe dan verifikasi teknis yang ketat. Dibandingkan dengan Jepang atau Eropa, Indonesia masih memiliki celah dalam hal infrastruktur pengisian daya dan jumlah stasiun pengisian. Namun, komitmen pemerintah untuk mencapai target net-zero emission diharapkan akan mempercepat adopsi regulasi yang lebih komprehensif di masa mendatang. Ada juga diskusi untuk memperkenalkan skema insentif berbasis karbon. Kami akan terus memantau perkembangannya.",
      tidak_terjawab: false,
      status_validasi: "Pending",
    },
];

const DUMMY_CHAT_HISTORY: ChatMessage[] = [
  { id: "1", sender: "user", text: "Halo, saya mau tanya tentang produk A." },
  {
    id: "2",
    sender: "agent",
    text: "Tentu, produk A adalah produk terbaik kami. Ada yang spesifik yang ingin anda tanyakan?",
  },
  { id: "3", sender: "user", text: "Berapa harganya?" },
  { id: "4", sender: "agent", text: "Harganya 100 ribu rupiah." },
];

const HistoryValidationPage = () => {
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({ aiAnswer: "", validationStatus: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [histories, setHistories] = useState<ValidationHistoryItem[]>(DUMMY_HISTORY);

  // State baru untuk modal teks
  const [textModalState, setTextModalState] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({ isOpen: false, title: '', content: '' });

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const filteredHistories = useMemo(() => {
    return histories.filter((history) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const searchMatch =
        history.user.toLowerCase().includes(lowerSearchTerm) ||
        history.session_id.toLowerCase().includes(lowerSearchTerm) ||
        history.pertanyaan.toLowerCase().includes(lowerSearchTerm) ||
        history.jawaban_ai.toLowerCase().includes(lowerSearchTerm);

      const answerMatch = filters.aiAnswer
        ? (filters.aiAnswer === 'answered' ? !history.tidak_terjawab : history.tidak_terjawab)
        : true;
      const statusMatch = filters.validationStatus
        ? history.status_validasi === filters.validationStatus
        : true;

      return searchMatch && answerMatch && statusMatch;
    });
  }, [searchTerm, filters, histories]);

  const paginatedHistories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistories, currentPage, itemsPerPage]);


  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleAction = (action: ActionType, item: ValidationHistoryItem) => {
    if (action === 'view') {
      setChatModalOpen(true);
      // Logika fetch chat history bisa ditambahkan di sini
    } else if (action === 'approve') {
      setHistories(prev => prev.map(h =>
          h.id === item.id ? { ...h, status_validasi: 'Validated' } : h
      ));
      toast.success(`Pertanyaan telah divalidasi.`);
    } else if (action === 'reject') {
      setHistories(prev => prev.map(h =>
          h.id === item.id ? { ...h, status_validasi: 'Not Validated' } : h
      ));
      toast.error(`Pertanyaan ditandai tidak valid.`);
    }
  };

  const handleCloseChatModal = () => {
    setChatModalOpen(false);
  };

  // Handler baru untuk modal teks
  const handleViewText = (title: string, content: string) => {
    setTextModalState({ isOpen: true, title, content });
  };

  const handleCloseTextModal = () => {
    setTextModalState({ isOpen: false, title: '', content: '' });
  };

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <TableControls
            searchTerm={searchInput}
            searchPlaceholder="Cari berdasarkan pengguna, ID sesi, atau pertanyaan..."
            filters={filters}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onFilterChange={handleFilterChange}
            filterConfig={filterConfig}
          />
        </div>

        <HistoryValidationTable
          histories={paginatedHistories}
          onAction={handleAction}
          onViewText={handleViewText} // <-- Teruskan handler baru
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredHistories.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <ChatHistoryModal
        isOpen={chatModalOpen}
        onClose={handleCloseChatModal}
        chatHistory={DUMMY_CHAT_HISTORY}
      />

      {/* Render modal teks di sini */}
      <TextExpandModal
        isOpen={textModalState.isOpen}
        onClose={handleCloseTextModal}
        title={textModalState.title}
        content={textModalState.content}
      />
    </>
  );
};

export default HistoryValidationPage;