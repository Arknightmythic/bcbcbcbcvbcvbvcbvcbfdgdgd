import { useState, useEffect, useMemo } from 'react';
import type { Period } from '../utils/types';


interface UseDashboardHeaderLogicProps {
  onPeriodChange: (period: Period) => void;
  onCustomDateApply: (dates: { startDate: string; endDate: string }) => void;
  defaultPeriod: Period;
  defaultStartDate: string;
  defaultEndDate: string;
}

interface UseDashboardHeaderLogicResult {
  currentTime: Date;
  activePeriod: Period;
  isCustomDateVisible: boolean;
  startDate: string;
  endDate: string;
  formattedTime: string;
  handlePeriodClick: (period: Period) => void;
  handleApplyClick: () => void;
  handleRangeChange: (start: string, end: string) => void;
  buttonBaseClasses: string;
  buttonInactiveClasses: string;
  buttonActiveClasses: string;
}

export const useDashboardHeaderLogic = ({
  onPeriodChange,
  onCustomDateApply,
  defaultPeriod,
  defaultStartDate,
  defaultEndDate,
}: UseDashboardHeaderLogicProps): UseDashboardHeaderLogicResult => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [activePeriod, setActivePeriod] = useState<Period>(defaultPeriod);
  const [isCustomDateVisible, setIsCustomDateVisible] = useState(defaultPeriod === 'custom');
  
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  useEffect(() => {
    setActivePeriod(defaultPeriod);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setIsCustomDateVisible(defaultPeriod === 'custom');
  }, [defaultPeriod, defaultStartDate, defaultEndDate]);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = useMemo(() => currentTime.toLocaleString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }), [currentTime]);

  const handlePeriodClick = (period: Period) => {
    setActivePeriod(period);
    if (period === 'custom') {
      setIsCustomDateVisible(true);
    } else {
      setIsCustomDateVisible(false);
      onPeriodChange(period);
    }
  };

  const handleApplyClick = () => {
    if (startDate && endDate) {
      onCustomDateApply({ startDate, endDate });
      onPeriodChange('custom');
    }
  };

  const handleRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  const buttonBaseClasses = 'py-2 px-3 md:py-1.5 md:px-5 rounded font-medium transition-all duration-300 text-xs flex-1 whitespace-nowrap';
  const buttonInactiveClasses = 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-200';
  const buttonActiveClasses = 'bg-blue-600 text-white shadow-md';

  return {
    currentTime,
    activePeriod,
    isCustomDateVisible,
    startDate,
    endDate,
    formattedTime,
    handlePeriodClick,
    handleApplyClick,
    handleRangeChange,
    buttonBaseClasses,
    buttonInactiveClasses,
    buttonActiveClasses,
  };
};