import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

/* ---- Load cart from localStorage ---- */
const loadState = () => {
  try {
    const serialized = localStorage.getItem("cartState");
    if (!serialized) return undefined;
    return { cart: JSON.parse(serialized) };
  } catch {
    return undefined;
  }
};

/* ---- Save cart to localStorage ---- */
const saveState = (state: any) => {
  try {
    localStorage.setItem("cartState", JSON.stringify(state.cart));
  } catch { }
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState: typeof window !== "undefined" ? loadState() : undefined,
});

/* Persist on every change */
store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;