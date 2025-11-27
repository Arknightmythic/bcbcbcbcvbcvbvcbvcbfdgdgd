import { useEffect, useRef, useState } from 'react';

export const useDraggable = (
  containerRef: React.RefObject<HTMLElement | null>,
  handleRef: React.RefObject<HTMLElement | null>,
  onDrag: (deltaY: number) => void,
  enabled: boolean = true 
) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (handleRef.current?.contains(e.target as Node)) {
        setIsDragging(true);
        startY.current = e.clientY;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const deltaY = e.clientY - startY.current;
      startY.current = e.clientY;
      onDrag(deltaY);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const currentHandle = handleRef.current;
    currentHandle?.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      currentHandle?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (document.body.style.cursor === 'ns-resize') {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isDragging, containerRef, handleRef, onDrag, enabled]);
};