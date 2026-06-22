import { create } from 'zustand';

// Shared list filters (section 5.2 universal query params).
const defaultFilters = {
  search: '',
  status: [],
  from_date: '',
  to_date: '',
  page: 1,
  limit: 25,
  sort_by: 'created_at',
  sort_order: 'desc',
};

export const useFilterStore = create((set) => ({
  filters: { ...defaultFilters },
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value, page: key === 'page' ? value : 1 } })),
  toggleStatus: (status) =>
    set((s) => {
      const exists = s.filters.status.includes(status);
      return {
        filters: {
          ...s.filters,
          status: exists
            ? s.filters.status.filter((x) => x !== status)
            : [...s.filters.status, status],
          page: 1,
        },
      };
    }),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
}));
