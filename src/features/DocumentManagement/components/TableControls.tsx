import React from 'react';
import { Search } from 'lucide-react';
import CustomSelect from '../../../shared/components/CustomSelect'; // Pastikan path ini benar
import type { DocumentCategory } from '../types/types';

// Definisikan bentuk dari objek filter
export interface Filters {
  type: string; 
  category: DocumentCategory | '';
  status: string;
}

interface TableControlsProps {
  searchTerm: string;
  filters: Filters;
  onSearchChange: (value: string) => void;
  onFilterChange: (filterName: keyof Filters, value: string) => void;
}

// Opsi untuk dropdown filter
const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'panduan', label: 'Panduan' },
  { value: 'uraian', label: 'Uraian' },
  { value: 'peraturan', label: 'Peraturan' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'PDF', label: 'PDF' },
  { value: 'DOCX', label: 'DOCX' },
  { value: 'JPG', label: 'JPG' },
];

const TableControls: React.FC<TableControlsProps> = ({
  searchTerm,
  filters,
  onSearchChange,
  onFilterChange,
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-t-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <label htmlFor="search-doc-management" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search-doc-management"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search by name, staff..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        {/* Filter by Document Type */}
        <div>
          <CustomSelect
            selectedType="default"
            value={filters.type}
            onChange={(value) => onFilterChange('type', value)}
            options={typeOptions}
          />
        </div>

        {/* Filter by Category */}
        <div>
          <CustomSelect
            selectedType="default"
            value={filters.category}
            onChange={(value) => onFilterChange('category', value)}
            options={categoryOptions}
          />
        </div>

        {/* Filter by Status */}
        <div>
          <CustomSelect
            selectedType="default"
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
            options={statusOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default TableControls;