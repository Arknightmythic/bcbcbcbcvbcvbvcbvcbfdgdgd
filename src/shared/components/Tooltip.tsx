import { useState, useRef, type ReactNode, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

const portalRoot = document.body;
const Tooltip = ({ text, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setPosition(null);
  };

  useLayoutEffect(() => {
    if (isVisible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={ref}
      role="none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex justify-center items-center"
    >
      {children}
      {isVisible && position && createPortal(
        <div 
          className="fixed z-[9999] w-auto min-w-max rounded-md bg-gray-800 p-2 text-xs text-white shadow-lg"
          style={{ 
            top: `${position.top}px`, 
            left: `${position.left}px`,
            transform: 'translateY(-50%)',
          }}
        >
          {text}
        </div>,
        portalRoot 
      )}
    </div>
  );
};

export default Tooltip;