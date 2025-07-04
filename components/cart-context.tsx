"use client"
import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  title: string;
  brand: string;
  image: string;
  price: number;
  size?: string;
  quantity: number;
  variantId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size?: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, size: string | undefined, quantity: number) => void;
  getCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Persistencia con localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      // Si ya existe el mismo producto+size, suma cantidad
      const idx = prev.findIndex(
        i => i.id === item.id && i.size === item.size
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string, size?: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)));
  };

  const clearCart = () => setItems([]);

  const updateQuantity = (id: string, size: string | undefined, quantity: number) => {
    setItems(prev => prev.map(i =>
      i.id === id && i.size === size ? { ...i, quantity } : i
    ));
  };

  const getCount = () => items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, updateQuantity, getCount }}>
      {children}
    </CartContext.Provider>
  );
}
