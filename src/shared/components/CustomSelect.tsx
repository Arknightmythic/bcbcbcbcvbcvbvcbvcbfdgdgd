import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

type SelectOptionType = 'default' | 'pagerow';
type SelectDirection = 'up' | 'down';

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  selectedType: SelectOptionType;
  direction?: SelectDirection;
  disabled?: boolean; // <-- PROPERTI BARU DITAMBAHKAN
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  selectedType,
  direction = 'down',
  disabled = false // <-- NILAI DEFAULT
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const dropdownPositionClass = direction === 'up'
    ? 'bottom-full mb-1'
    : 'mt-1';

  return (
    <div className={`relative ${selectedType ==='default' ?'w-full':''}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)} // <-- LOGIKA DISABLED
        disabled={disabled} // <-- ATRIBUT DISABLED
        className={`flex items-center justify-between w-full px-2.5 ${selectedType==='default'?'py-2.5':'py-[6px]'} bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`} // <-- STYLE DISABLED
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && ( // <-- LOGIKA DISABLED
        <div className={`absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto ${dropdownPositionClass}`}>
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`px-4 py-2 text-xs cursor-pointer hover:bg-gray-100 ${value === option.value ? 'font-semibold bg-gray-100' : 'text-gray-700'}`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;