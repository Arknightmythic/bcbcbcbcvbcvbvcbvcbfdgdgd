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
  
  onSearchSubmit: () => void;
  onFilterChange: (filterName: keyof T, value: string) => void; 
  filterConfig: FilterConfig<T>[];
}

const TableControls = <T extends object>({
  searchTerm,
  searchPlaceholder,
  filters,
  onSearchChange,
  onSearchSubmit, 
  onFilterChange,
  filterConfig,
}: TableControlsProps<T>) => {

  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="py-4 bg-gray-50 rounded-t-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input and Button */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3 w-3 text-gray-400" />
            </div>
            <input
              type="text"
              id="table-search"
              className="bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown} 
            />
          </div>
          <button
            onClick={onSearchSubmit}
            className="px-4 py-2.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
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