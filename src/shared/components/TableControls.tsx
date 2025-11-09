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

      <div className="flex flex-col lg:flex-row items-center">

        <div className="flex items-center gap-2 w-full lg:w-2/5">
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

        {/* --- BARIS 2 (Mobile) / KOLOM 2 (Desktop) : Filters --- */}
        {/* - 'grid-cols-3' (Mobile/Tablet): Filter akan menjadi 3 kolom.
          - 'w-full' (Mobile/Tablet): Kontainer grid akan mengambil lebar penuh.
          - 'lg:w-3/5' (Desktop): Kontainer grid akan mengambil 3/5 lebar.
          - 'lg:grid-cols-3' (Desktop): Tetap 3 kolom di desktop.
        */}
        <div className="grid grid-cols-3 gap-4 w-full lg:w-3/5 mt-4 lg:mt-0 ml-0 lg:ml-4">
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
    </div>
  );
};

export default TableControls;