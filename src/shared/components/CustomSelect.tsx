import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  selectedType,
  direction = 'down',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // 1. Hitung langsung
      updateCoords();
      
      // 2. FIX GLITCH: Hitung ulang setelah frame animasi browser selesai
      // Ini mengatasi masalah saat Panel Filter baru saja terbuka/animasi
      const animFrame = requestAnimationFrame(() => {
        updateCoords();
      });

      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);

      return () => {
        cancelAnimationFrame(animFrame);
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cek apakah tombol yang diklik
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }

      if (isOpen) {
        const dropdownElement = document.getElementById('custom-select-dropdown');
        // Jika klik di luar dropdown, tutup
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    
    // Gunakan mousedown agar lebih cepat dari click
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getDropdownStyle = () => {
    if (!buttonRect) return {};

    const gap = 4;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const commonStyle: React.CSSProperties = {
      left: buttonRect.left + scrollX,
      width: buttonRect.width,
      maxHeight: '240px',
    };

    if (direction === 'up') {
      return {
        ...commonStyle,
        top: buttonRect.top + scrollY - gap, 
        transform: 'translateY(-100%)', 
      };
    }

    return {
      ...commonStyle,
      top: buttonRect.bottom + scrollY + gap,
    };
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-between px-2.5 
          ${selectedType === 'default' ? 'w-full py-2.5' : 'py-[6px] min-w-[70px]'} 
          bg-white border border-gray-300 text-gray-900 text-xs rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors`}
      >
        <span className="truncate mr-2">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && createPortal(
        <div 
          id="custom-select-dropdown"
          className={`absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-fade-in
            ${direction === 'up' ? 'origin-bottom' : 'origin-top'}
          `}
          style={getDropdownStyle()}
        >
          <ul className="py-1 overflow-y-auto max-h-[240px] custom-scrollbar">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`px-4 py-2 text-xs cursor-pointer transition-colors hover:bg-blue-50 
                  ${value === option.value ? 'font-semibold bg-blue-50 text-blue-700' : 'text-gray-700'}`}
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