import { useState, useRef, type ReactNode, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

// Tentukan di mana portal akan di-render. document.body adalah pilihan umum.
const portalRoot = document.body;

const Tooltip = ({ text, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // Posisi: (top) sejajar dengan tengah elemen, (left) di sebelah kanan elemen + 8px margin
      setPosition({
        top: rect.top + rect.height / 2, // Pusatkan secara vertikal
        left: rect.right + 8, // 8px di sebelah kanan
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setPosition(null);
  };

  // Gunakan useLayoutEffect untuk menangani positioning jika user scroll
  useLayoutEffect(() => {
    if (isVisible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    }
  }, [isVisible]); // Hitung ulang jika isVisible berubah (misal: saat scroll)

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex justify-center items-center"
    >
      {children}
      {isVisible && position && createPortal(
        <div 
          className="fixed z-[9999] w-auto min-w-max rounded-md bg-gray-800 p-2 text-xs text-white shadow-lg"
          // Terapkan style untuk positioning
          // Tambahkan transform untuk memusatkan vertikal dengan sempurna
          style={{ 
            top: `${position.top}px`, 
            left: `${position.left}px`,
            transform: 'translateY(-50%)',
          }}
        >
          {text}
        </div>,
        portalRoot // Render di luar #root
      )}
    </div>
  );
};

export default Tooltip;