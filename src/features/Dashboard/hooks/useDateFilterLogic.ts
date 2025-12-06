// File: src/shared/hooks/useDateFilterLogic.ts
import { useState, useEffect } from 'react';
import type { Period } from '../utils/types';


interface UseDateFilterParams {
  defaultPeriod: Period;
  defaultStartDate: string;
  defaultEndDate: string;
  onPeriodChange: (period: Period) => void;
  onCustomDateApply: (dates: { startDate: string; endDate: string }) => void;
}

export const useDateFilterLogic = ({
  defaultPeriod,
  defaultStartDate,
  defaultEndDate,
  onPeriodChange,
  onCustomDateApply
}: UseDateFilterParams) => {
  const [activePeriod, setActivePeriod] = useState<Period>(defaultPeriod);
  const [isCustomDateVisible, setIsCustomDateVisible] = useState(defaultPeriod === 'custom');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  // Sync state when props change
  useEffect(() => {
    setActivePeriod(defaultPeriod);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setIsCustomDateVisible(defaultPeriod === 'custom');
  }, [defaultPeriod, defaultStartDate, defaultEndDate]);

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

  return {
    activePeriod,
    isCustomDateVisible,
    startDate,
    endDate,
    handlePeriodClick,
    handleApplyClick,
    handleRangeChange
  };
};