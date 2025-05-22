// context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { CART_API } from '../config/apiConfig';
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async (customerId) => {
    const res = await axios.get(`${CART_API}/${customerId}`);
    setCartItems(res.data);
  };

  const addToCart = async (newItem) => {
    const res = await axios.post(`${CART_API}/add`, newItem);
    setCartItems((prev) => [...prev, res.data]);
  };

  const updateQuantity = async (cart_item_id, quantity) => {
    const res = await axios.patch(`${CART_API}/update`, {
      cart_item_id,
      quantity,
    });
    setCartItems((prev) =>
      prev.map((item) =>
        item.cart_item_id === cart_item_id ? res.data : item
      )
    );
  };

  const removeFromCart = async (cartItemId) => {
    await axios.delete(`${CART_API}delete/${cartItemId}`);
    setCartItems((prev) =>
      prev.filter((item) => item.cart_item_id !== cartItemId)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
