import React from 'react';
import { Search } from 'lucide-react';
import type { DocumentCategory } from '../types/types';
import CustomSelect from '../../../shared/components/CustomSelect';


// Define the shape of the filter values
export interface Filters {
  date: string;
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

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'panduan', label: 'Panduan' },
  { value: 'uraian', label: 'Uraian' },
  { value: 'peraturan', label: 'Peraturan' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
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
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Search by name, staff, team..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filter by Type */}
        <div>
          <select
            id="type-filter"
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="">All Types</option>
            <option value="PDF">PDF</option>
            <option value=TXT>DOCX</option>
          </select>
        </div>

       {/* Filter by Category */}
        <div>
          <CustomSelect
            value={filters.category}
            onChange={(value) => onFilterChange('category', value)}
            options={categoryOptions}
            selectedType='default'
          />
        </div>

        {/* Filter by Status */}
        <div>
          <CustomSelect
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
            options={statusOptions}
            selectedType='default'
          />
        </div>
      </div>
    </div>
  );
};

export default TableControls;