import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import WishlistCard from '../../components/ui/WishlistCard'; // Import the WishlistCard component
import { WISHLIST_API } from '../../config/apiConfig'; // Import the WISHLIST_API from apiConfig
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { SafeAreaView } from "react-native-safe-area-context";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);  // State to store wishlist items
  const [loading, setLoading] = useState(true);  // State for loading indicator
  const [error, setError] = useState(null);  // State for error handling

  // Fetch wishlist items from the server
  const fetchWishlist = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (userData) {
        const user = JSON.parse(userData);
        if (user.role.toLowerCase() === "customer") {
          const customerId = user.id;

          const response = await fetch(`${WISHLIST_API}/${customerId}`);
          const data = await response.json();

          if (response.ok) {
            setWishlist(data);  // Set wishlist data
          } else {
            setError('Error fetching wishlist items');
          }
        } else {
          setError('Wishlist is only available for customers.');
        }
      } else {
        setError('User not found. Please sign in.');
      }
    } catch (error) {
      setError('Error fetching wishlist items');
      console.error(error);
    } finally {
      setLoading(false);  // Stop loading spinner
    }
  };

  // Automatically refresh the wishlist when the screen/tab is focused
  useFocusEffect(() => {
    setLoading(false); // Start loading
    fetchWishlist();   // Re-fetch wishlist when screen/tab is focused

    return () => {
      // Cleanup function if needed (in this case, no cleanup is required)
    };
  });

  // Loading state UI
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#704F38" />
      </View>
    );
  }

  // Error state UI
  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  // UI when wishlist is empty
  if (wishlist.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Your wishlist is empty.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="h-full bg-gray-100">
      <View className="mt-5 mb-5">
        <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Wishlist</Text>
      </View>

      <FlatList
        data={wishlist}
        renderItem={({ item }) => <WishlistCard product={item} />}
        keyExtractor={(item) => item.wishlist_id ? item.wishlist_id.toString() : item.product_id.toString()}
        refreshing={loading}  // Show loading spinner when refreshing
        contentContainerStyle={{ paddingHorizontal: 16 }} // Add padding for content
      />
    </SafeAreaView>
  );
};

export default Wishlist;
