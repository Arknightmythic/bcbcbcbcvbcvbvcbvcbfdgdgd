// src/features/Guide/pages/GuidePage.tsx

import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import TableControls from "../../../shared/components/tablecontrols/TableControls"; // Pastikan path ini sesuai
import PdfViewModal from "../../../shared/components/PDFViewModal"; // Pastikan path ini sesuai
import GuideTable from "../components/GuideTable";
import { useGetGuides } from "../hooks/useGuide";
import { generateGuideViewUrl } from "../api/guideApi";
import type { Guide, SortOrder } from "../types/types";

const GuidePage: React.FC = () => {
  // --- State Management ---
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<SortOrder>("desc");

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewableUrl, setViewableUrl] = useState<string | null>(null);
  const [viewableTitle, setViewableTitle] = useState<string>("");
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  // --- API Params ---
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', String(itemsPerPage));
    params.set('offset', String((currentPage - 1) * itemsPerPage));
    
    if (searchTerm) params.set('search', searchTerm);
    
    if (sortColumn) {
      params.set('sort_by', sortColumn);
      params.set('sort_direction', sortDirection);
    }

    return params;
  }, [currentPage, itemsPerPage, searchTerm, sortColumn, sortDirection]);

  // --- Fetch Data ---
  const { data: guideData, isLoading, isError } = useGetGuides(searchParams);

  const guides = useMemo(() => guideData?.data || [], [guideData]);
  const totalItems = useMemo(() => guideData?.total || 0, [guideData]);

  // --- Handlers ---
  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleOpenViewFile = async (guide: Guide) => {
    setIsViewModalOpen(true);
    setIsGeneratingUrl(true);
    setViewableTitle(guide.title);
    
    try {
      const response = await generateGuideViewUrl(guide.id);
      setViewableUrl(response.data.url);
    } catch (error) {
      console.error("Failed to get view URL:", error);
      toast.error("tidak dapat memuat pratinjau panduan.");
      setIsViewModalOpen(false); 
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewableUrl(null);
    setViewableTitle("");
  };

  // --- Filters Config (Hanya Search untuk Guide, jika belum ada filter lain) ---
  // Kita gunakan TableControls tapi tanpa filter dropdown karena Guide biasanya simple
  // Jika butuh filter, tambahkan di sini.
  const filters = {}; // Dummy filter object
  const handleFilterChange = () => {}; // Dummy handler

  return (
    <div className="flex flex-col h-full">
    
      <div className="flex flex-col flex-1 min-h-0">
        <div className="px-4 bg-gray-50 rounded-t-lg shadow-md">
          <TableControls
            searchTerm={searchInput}
            searchPlaceholder="Cari Panduan"
            filters={filters as any}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onFilterChange={handleFilterChange}
            filterConfig={[]} // Kosongkan jika tidak ada filter dropdown
          />
        </div>

        <GuideTable
          guides={guides}
          isLoading={isLoading}
          isError={isError}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewFile={handleOpenViewFile}
        />
      </div>

      <PdfViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        url={viewableUrl}
        isLoading={isGeneratingUrl}
        title={viewableTitle}
      />
    </div>
  );
};

export default GuidePage;