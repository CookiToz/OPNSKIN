import { create } from 'zustand';

export type Skin = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type CartState = {
  items: Skin[];
  add: (skin: Skin) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCartStore = create<CartState>((set: (fn: (state: CartState) => Partial<CartState> | CartState) => void, get: () => CartState) => ({
  items: [],
  add: (skin: Skin) => set((state: CartState) => ({
    items: state.items.find((s: Skin) => s.id === skin.id)
      ? state.items
      : [...state.items, skin],
  })),
  remove: (id: string) => set((state: CartState) => ({
    items: state.items.filter((s: Skin) => s.id !== id),
  })),
  clear: () => set((state: CartState) => ({ ...state, items: [] })),
  total: () => get().items.reduce((sum: number, s: Skin) => sum + s.price, 0),
})); 