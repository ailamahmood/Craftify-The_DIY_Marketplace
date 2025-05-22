import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { CART_API } from '../../config/apiConfig'; // Adjust the path based on your structure
import AsyncStorage from '@react-native-async-storage/async-storage';
import CartCard from '../../components/ui/CartCard';  // Import the CartCard component
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import CustomButton from "../../components/ui/CustomButton";
import { router } from "expo-router";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);  // State for cart items
  const [loading, setLoading] = useState(true);    // State for loading indicator
  const [customerId, setCustomerId] = useState(null);  // State for customer ID
  const [totalPrice, setTotalPrice] = useState(0);  // State for total price

  // Fetch customer ID from AsyncStorage
  useEffect(() => {
    const fetchCustomerId = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCustomerId(user.id);  // Set customer_id from AsyncStorage
      }
    };
    fetchCustomerId();
  }, []);


  // Fetch cart items from the API
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${CART_API}/${customerId}`);
      setCartItems(response.data);  // Set cart items
      calculateTotalPrice(response.data);  // Calculate the total price
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to fetch cart items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price for the cart
  const calculateTotalPrice = (items) => {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  // Handle remove item from cart
  const handleRemoveFromCart = async (cart_item_id) => {
    try {
      await axios.delete(`${CART_API}/delete/${cart_item_id}`);
      Alert.alert('Success', 'Item removed from cart');
      fetchCartItems();  // Refresh cart after removal
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert('Error', 'An error occurred while removing the item from the cart.');
    }
  };

  // Handle increase quantity
  const handleIncrease = async (cart_item_id) => {
    const item = cartItems.find((item) => item.cart_item_id === cart_item_id);
    const newQuantity = item.quantity + 1;

    try {
      await axios.patch(`${CART_API}/update`, {
        cart_item_id,
        quantity: newQuantity,
      });
      fetchCartItems();  // Refresh cart after updating
    } catch (error) {
      console.error('Error increasing quantity:', error);
      Alert.alert('Error', 'An error occurred while increasing the item quantity.');
    }
  };

  // Handle decrease quantity
  const handleDecrease = async (cart_item_id) => {
    const item = cartItems.find((item) => item.cart_item_id === cart_item_id);
    if (item.quantity <= 1) return;

    const newQuantity = item.quantity - 1;

    try {
      await axios.patch(`${CART_API}/update`, {
        cart_item_id,
        quantity: newQuantity,
      });
      fetchCartItems();  // Refresh cart after updating
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      Alert.alert('Error', 'An error occurred while decreasing the item quantity.');
    }
  };

  // Automatically refresh the cart when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (customerId) {
        fetchCartItems();  // Only run if customerId is set
      }
    }, [customerId])
  );
  

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#8B4513" />
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-gray-500">Your cart is empty.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="mt-5 mb-1">
        <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Cart</Text>
      </View>

      <ScrollView className="p-4">
        {cartItems.map((item) => (
          <CartCard
            key={item.cart_item_id}
            product={{
              product_id: item.product_id,
              product_name: item.product_name,
              price: item.price,
              selectedOptions: item.selected_options
                ? Object.entries(item.selected_options).map(([k, v]) => `${k}: ${v}`)
                : [],
              image_url: item.media_url || '',
            }}
            quantity={item.quantity}
            onIncrease={() => handleIncrease(item.cart_item_id)}
            onDecrease={() => handleDecrease(item.cart_item_id)}
            onRemove={() => handleRemoveFromCart(item.cart_item_id)}
          />
        ))}
      </ScrollView>

      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-i28_semibold">Total: PKR {totalPrice.toFixed(2)}</Text>
        </View>
        <CustomButton
          containerStyles="w-full"
          disabled={loading}
          title={loading ? "Proceeding..." : "Proceed to Checkout"}
          onPress={() => router.push("/CheckoutScreen")} // Add onPress handler
        />
      </View>
    </SafeAreaView>
  );
};

export default Cart;
