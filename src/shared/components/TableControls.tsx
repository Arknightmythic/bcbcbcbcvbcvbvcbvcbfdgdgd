import { Search } from 'lucide-react';
import CustomSelect from './CustomSelect';

export interface FilterConfig<T> {
  key: keyof T & string; 
  options: { value: string; label: string }[];
}

interface TableControlsProps<T extends object> {
  searchTerm: string;
  searchPlaceholder: string;
  filters: T; 
  onSearchChange: (value: string) => void;
  onFilterChange: (filterName: keyof T, value: string) => void; 
  filterConfig: FilterConfig<T>[];
}

const TableControls = <T extends object>({
  searchTerm,
  searchPlaceholder,
  filters,
  onSearchChange,
  onFilterChange,
  filterConfig,
}: TableControlsProps<T>) => {
  return (
    <div className="p-4 bg-gray-50 rounded-t-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <label htmlFor="table-search" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="table-search"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filter yang dirender secara dinamis */}
        {filterConfig.map((config) => (
          <div key={config.key}>
            <CustomSelect
              selectedType="default"
              value={String(filters[config.key] ?? '')}
              onChange={(value) => onFilterChange(config.key, value)}
              options={config.options}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableControls;