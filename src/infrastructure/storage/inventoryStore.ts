import { Product, ProductFilters } from '@/domain/entities/Product';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InventoryState {
  products: Product[];
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  categories: string[];
  suppliers: string[];
}

interface InventoryActions {
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  setCategories: (categories: string[]) => void;
  setSuppliers: (suppliers: string[]) => void;
  reset: () => void;
}

type InventoryStore = InventoryState & InventoryActions;

const initialState: InventoryState = {
  products: [],
  filters: {},
  isLoading: false,
  error: null,
  selectedProduct: null,
  categories: [],
  suppliers: [],
};

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      ...initialState,

      setProducts: (products) => set({ products }),

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      updateProduct: (id, updatedProduct) =>
        set((state) => ({
          products: state.products.map((product) => (product.id === id ? updatedProduct : product)),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        })),

      setFilters: (filters) => set({ filters }),

      clearFilters: () => set({ filters: {} }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setSelectedProduct: (selectedProduct) => set({ selectedProduct }),

      setCategories: (categories) => set({ categories }),

      setSuppliers: (suppliers) => set({ suppliers }),

      reset: () => set(initialState),
    }),
    {
      name: 'inventory-storage',
      partialize: (state) => ({
        products: state.products,
        filters: state.filters,
        categories: state.categories,
        suppliers: state.suppliers,
      }),
    },
  ),
);
