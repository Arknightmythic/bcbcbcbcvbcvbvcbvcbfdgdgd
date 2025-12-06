// File: src/shared/hooks/useCurrentTime.ts
import { useState, useEffect, useMemo } from 'react';

export const useCurrentTime = (locale = 'id-ID') => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = useMemo(() => currentTime.toLocaleString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }), [currentTime, locale]);

  return { currentTime, formattedTime };
};