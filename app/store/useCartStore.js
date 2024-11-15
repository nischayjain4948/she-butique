import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      
      addToCart: (product) => {
        const existingItem = get().cartItems.find((item) => item.id === product.id);
        
        if (existingItem) {
          // If product already in cart, don't add again; optionally, you could increase quantity
          return;
        }
        
        // Add product with default quantity of 1
        set((state) => ({ 
          cartItems: [...state.cartItems, { ...product, quantity: 1 }] 
        }));
      },
      
      removeFromCart: (productId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== productId),
        }));
      },
      
      updateQuantity: (productId, newQuantity) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          ),
        }));
      },
      
      cartItemCount: () => get().cartItems.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: 'cart-storage', // Key for local storage
      getStorage: () => localStorage,
    }
  )
);

export default useCartStore;
