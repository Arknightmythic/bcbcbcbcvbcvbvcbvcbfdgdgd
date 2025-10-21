import { useEffect, useRef, type RefObject} from 'react';

type Callback = () => void;

export const useClickOutside = <T extends HTMLElement>(callback: Callback): RefObject<T> => {
  const ref: RefObject<T> = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
};