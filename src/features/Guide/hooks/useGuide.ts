// src/features/Guide/hooks/useGuide.ts

import { useQuery } from '@tanstack/react-query';
import { getGuides } from '../api/guideApi';

export const useGetGuides = (params: URLSearchParams) => {
  return useQuery({
    queryKey: ['guides', params.toString()],
    queryFn: () => getGuides(params),
    placeholderData: (prev) => prev, // Keep previous data while fetching new data
  });
};