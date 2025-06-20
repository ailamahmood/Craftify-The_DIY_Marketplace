import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import SellerProductCard from './SellerProductCard';
import { SELLERPRODUCT_API } from '../../config/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const SellerProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);

      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);

      const token = user?.token;
      if (!token) {
        console.error('Token not found in user object');
        return;
      }

      const response = await axios.get(`${SELLERPRODUCT_API}/Q`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching seller products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <SellerProductCard
      item={{
        product_id: item.product_id,
        image: item.media?.[0]?.media_url || 'https://placehold.co/400',
        name: item.product_name,
        price: item.price,
        rating: item.avg_rating,
        stock_quantity: item.stock_quantity,

      }}
      onPress={() => {
        console.log('Product pressed:', item.product_name);
        console.log('Product ID:', item.product_id); 
        router.push({
          pathname: '(Sscreens)/EditProduct',
          params: { productId: item.product_id },
        });
      }}
    />
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (!products.length) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">No products found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 mt-2">
      <FlatList
        data={products}
        keyExtractor={(item) => item.product_id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default SellerProductList;
