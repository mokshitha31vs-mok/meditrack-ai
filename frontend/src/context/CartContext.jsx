import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState({ items: [], total_amount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || user?.role !== 'patient') return;
    try {
      setLoading(true);
      const res = await cartAPI.get();
      setCart(res.data);
    } catch (err) {
      console.log("Cart fetch notice:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user?.id]);

  const addToCart = async (itemData) => {
    try {
      const res = await cartAPI.add(itemData);
      setCart(res.data.cart);
      return { success: true, message: 'Medicine added to cart!' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to add item to cart.' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartAPI.update(itemId, { quantity });
      setCart(res.data.cart);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await cartAPI.remove(itemId);
      setCart(res.data.cart);
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart({ items: [], total_amount: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      itemCount: cart.items ? cart.items.reduce((acc, i) => acc + i.quantity, 0) : 0
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
