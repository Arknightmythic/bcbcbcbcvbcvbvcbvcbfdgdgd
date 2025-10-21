import { useState, useRef, type ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

const Tooltip = ({ text, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex justify-center items-center"
    >
      {children}
      {isVisible && (
        <div className="absolute left-full z-50 ml-2 w-auto min-w-max rounded-md bg-gray-800 p-2 text-xs text-white shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;