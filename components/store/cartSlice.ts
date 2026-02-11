import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  weight: number;
  quantity: number;
  price: number;
  displayName: string;
  image?: any;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // Managed by Redux for global toggle
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (i) => i.weight === action.payload.weight,
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.isOpen = true; // Auto-open cart on add
    },

    updateQuantity: (state, action: PayloadAction<{ weight: number; quantity: number }>) => {
      const item = state.items.find((i) => i.weight === action.payload.weight);
      if (item) {
        const newQty = item.quantity + action.payload.quantity;
        if (newQty > 0) {
          item.quantity = newQty;
        } else {
          state.items = state.items.filter((i) => i.weight !== action.payload.weight);
        }
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.weight !== action.payload);
    },

    clearCart: (state) => {
      state.items = [];
    },

    toggleCart: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    }
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, toggleCart } = cartSlice.actions;
export default cartSlice.reducer;
