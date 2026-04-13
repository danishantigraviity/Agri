import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCompareStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        if (items.length >= 3) return false;
        if (items.find((i) => i._id === product._id)) return false;
        set({ items: [...items, product] });
        return true;
      },
      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((i) => i._id !== productId) });
      },
      clearCompare: () => set({ items: [] }),
    }),
    {
      name: 'agrimarket-compare',
    }
  )
);

export default useCompareStore;
