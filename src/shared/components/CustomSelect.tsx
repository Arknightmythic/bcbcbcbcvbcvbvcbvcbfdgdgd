import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

type SelectOptionType = 'default' | 'pagerow';

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  selectedType: SelectOptionType;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  selectedType,
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  // Hitung posisi dropdown saat dibuka
  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4, // Sedikit gap ke bawah
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      // Update posisi saat scroll/resize
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  // Handle click outside untuk Portal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        // Cek apakah klik terjadi di dalam elemen portal (dropdown)
        const dropdownElement = document.getElementById('custom-select-dropdown');
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        className={`flex items-center justify-between w-full px-2.5 ${selectedType==='default'?'py-2.5':'py-[6px]'} bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Render Dropdown menggunakan Portal */}
      {isOpen && !disabled && createPortal(
        <div 
          id="custom-select-dropdown"
          className="absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fade-in"
          style={{
            top: coords.top,
            left: coords.left,
            width: coords.width,
            maxHeight: '240px', // Max height agar tidak terlalu panjang
          }}
        >
          <ul className="py-1 overflow-y-auto max-h-[240px] custom-scrollbar">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`px-4 py-2 text-xs cursor-pointer transition-colors hover:bg-blue-50 ${value === option.value ? 'font-semibold bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}
    </>
  );
};

export default CustomSelect;