import { useState, useCallback, useMemo } from 'react';
import { ClientFilters } from '@/domain/entities/Client';
import { useDebounce } from './useDebounce';

interface UseClientsFiltersOptions {
  initialFilters?: ClientFilters;
  debounceDelay?: number;
}

export const useClientsFilters = (options: UseClientsFiltersOptions = {}) => {
  const { initialFilters = {}, debounceDelay = 300 } = options;
  
  const [filters, setFilters] = useState<ClientFilters>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Debounce filters para evitar muitas requisições
  const debouncedFilters = useDebounce(filters, debounceDelay);

  const updateFilter = useCallback((key: keyof ClientFilters, value: string | Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ClientFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const clearFilter = useCallback((key: keyof ClientFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== ''
    );
  }, [filters]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  }, [filters]);

  const getFilterChips = useCallback(() => {
    return Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => ({
        key,
        label: `${key}: ${value}`,
        value,
      }));
  }, [filters]);

  return {
    // State
    filters,
    debouncedFilters,
    isExpanded,
    hasActiveFilters,
    activeFiltersCount,
    
    // Actions
    updateFilter,
    updateFilters,
    clearFilter,
    clearAllFilters,
    toggleExpanded,
    
    // Computed
    getFilterChips,
  };
}; 