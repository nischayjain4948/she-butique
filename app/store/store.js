// store.js
import { create } from 'zustand';

const useAdminStore = create((set) => ({
  counts: { users: 0, orders: 0, products: 0 },
  loading: true,
  setCounts: (newCounts) => set({ counts: newCounts }),
  setLoading: (isLoading) => set({ loading: isLoading }),
  incrementProductCount: () => set((state) => ({
    counts: { ...state.counts, products: state.counts.products + 1 }
  })),
}));

export default useAdminStore;
