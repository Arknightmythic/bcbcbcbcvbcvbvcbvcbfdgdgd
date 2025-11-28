import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import { formatDate } from "../../utils/formatDate"; // Sesuaikan path

// Export Interface
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig<T extends Record<string, any>> {
  key: string;
  label?: string;
  type?: "select" | "date-range";
  options?: FilterOption[];
  placeholder?: string;
  startDateKey?: string;
  endDateKey?: string;
}

// Props
interface UseTableControlsLogicProps<T extends Record<string, any>> {
  filters: T;
  onFilterChange: (filterName: keyof T, value: any) => void;
  filterConfig: FilterConfig<T>[];
  searchTerm: string;
  onSearchSubmit: () => void;
}

// Return Value
interface UseTableControlsLogicResult<T extends Record<string, any>> {
  activeDropdown: "filter" | "date" | null;
  coords: { top: number; left: number } | null;
  filterBtnRef: React.RefObject<HTMLButtonElement | null>;
  dateBtnRef: React.RefObject<HTMLButtonElement | null>;
  tempFilters: T;
  tempDateRange: [Date | null, Date | null];
  dateRangeConfig: FilterConfig<T> | undefined;
  dropdownFilters: FilterConfig<T>[];
  toggleDropdown: (type: "filter" | "date") => void;
  handleApplyFilters: () => void;
  handleApplyDate: () => void;
  handleResetDate: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  getDateButtonLabel: () => string;
  setTempFilters: React.Dispatch<React.SetStateAction<T>>;
  setTempDateRange: React.Dispatch<
    React.SetStateAction<[Date | null, Date | null]>
  >;
}

const calculatePosition = (
  element: HTMLElement | null,
  type: "filter" | "date"
) => {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const screenW = window.innerWidth;
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  // Mobile layout
  if (screenW < 640) {
    return {
      top: rect.bottom + scrollY + 8,
      left: 16,
    };
  }

  // Desktop layout
  const estimatedWidth = type === "date" ? 340 : 300;
  let leftPos = rect.left + scrollX;

  if (rect.left + estimatedWidth > screenW) {
    const rightAlign = rect.right + scrollX;
    leftPos = Math.max(10, rightAlign - estimatedWidth);
  }

  return {
    top: rect.bottom + scrollY + 6,
    left: leftPos,
  };
};

export const useTableControlsLogic = <T extends Record<string, any>>({
  filters,
  onFilterChange,
  filterConfig,
  onSearchSubmit,
}: UseTableControlsLogicProps<T>): UseTableControlsLogicResult<T> => {
  const [activeDropdown, setActiveDropdown] = useState<
    "filter" | "date" | null
  >(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);
  const [tempFilters, setTempFilters] = useState<T>(filters);
  const [tempDateRange, setTempDateRange] = useState<
    [Date | null, Date | null]
  >([null, null]);

  // Memoized Configs
  const dateRangeConfig = useMemo(
    () => filterConfig.find((c) => c.type === "date-range"),
    [filterConfig]
  );
  const dropdownFilters = useMemo(
    () => filterConfig.filter((c) => c.type !== "date-range"),
    [filterConfig]
  );

  const toggleDropdown = useCallback(
    (type: "filter" | "date") => {
      if (activeDropdown === type) {
        setActiveDropdown(null);
        setCoords(null);
      } else {
        const ref = type === "filter" ? filterBtnRef : dateBtnRef;
        const newCoords = calculatePosition(ref.current, type);
        if (newCoords) {
          setCoords(newCoords);
          setActiveDropdown(type);
        }
      }
    },
    [activeDropdown]
  );

  // Sync temp state when dropdown opens or filters prop changes
  useEffect(() => {
    if (activeDropdown === "filter") {
      setTempFilters({ ...filters });
    } else if (activeDropdown === "date" && dateRangeConfig) {
      const startStr = filters[dateRangeConfig.startDateKey as string];
      const endStr = filters[dateRangeConfig.endDateKey as string];
      setTempDateRange([
        startStr ? new Date(startStr) : null,
        endStr ? new Date(endStr) : null,
      ]);
    }
  }, [activeDropdown, filters, dateRangeConfig]);

  // Reposition on resize/scroll
  useLayoutEffect(() => {
    const handleResize = () => {
      if (activeDropdown) {
        const ref = activeDropdown === "filter" ? filterBtnRef : dateBtnRef;
        const newCoords = calculatePosition(ref.current, activeDropdown);
        if (newCoords) setCoords(newCoords);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [activeDropdown]);

  // Click outside handler (membantu memisahkan logika dari UI)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const portalEl = document.getElementById("table-controls-portal");
      const filterBtn = filterBtnRef.current;
      const dateBtn = dateBtnRef.current;
      // Perlu juga mengecek elemen CustomSelect jika ada
      const customSelectDropdown = document.getElementById(
        "custom-select-dropdown"
      ); 

      if (
        portalEl &&
        !portalEl.contains(event.target as Node) &&
        (!filterBtn || !filterBtn.contains(event.target as Node)) &&
        (!dateBtn || !dateBtn.contains(event.target as Node)) &&
        (!customSelectDropdown ||
          !customSelectDropdown.contains(event.target as Node))
      ) {
        setActiveDropdown(null);
        setCoords(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApplyFilters = useCallback(() => {
    dropdownFilters.forEach((config) => {
      if (tempFilters[config.key] !== filters[config.key]) {
        onFilterChange(config.key, tempFilters[config.key]);
      }
    });
    setActiveDropdown(null);
    setCoords(null);
  }, [dropdownFilters, tempFilters, filters, onFilterChange]);

  const handleApplyDate = useCallback(() => {
    if (!dateRangeConfig) return;
    const [start, end] = tempDateRange;
    onFilterChange(dateRangeConfig.startDateKey as keyof T, formatDate(start));
    onFilterChange(dateRangeConfig.endDateKey as keyof T, formatDate(end));
    setActiveDropdown(null);
    setCoords(null);
  }, [dateRangeConfig, tempDateRange, onFilterChange]);

  const handleResetDate = useCallback(() => {
    setTempDateRange([null, null]);
    if (dateRangeConfig) {
      if (dateRangeConfig.startDateKey)
        onFilterChange(dateRangeConfig.startDateKey as keyof T, "");
      if (dateRangeConfig.endDateKey)
        onFilterChange(dateRangeConfig.endDateKey as keyof T, "");
    }
    setActiveDropdown(null);
    setCoords(null);
  }, [dateRangeConfig, onFilterChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") onSearchSubmit();
    },
    [onSearchSubmit]
  );

  const getDateButtonLabel = useCallback(() => {
    if (!dateRangeConfig) return "";
    const start = filters[dateRangeConfig.startDateKey as string];
    const end = filters[dateRangeConfig.endDateKey as string];
    if (start && end) return `${start} - ${end}`;
    if (start) return `${start} - ...`;
    return dateRangeConfig.placeholder || "FIlter Tanggal";
  }, [filters, dateRangeConfig]);

  return {
    activeDropdown,
    coords,
    filterBtnRef,
    dateBtnRef,
    tempFilters,
    tempDateRange,
    dateRangeConfig,
    dropdownFilters,
    toggleDropdown,
    handleApplyFilters,
    handleApplyDate,
    handleResetDate,
    handleKeyDown,
    getDateButtonLabel,
    setTempFilters,
    setTempDateRange,
  };
};