import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { WISHLIST_API } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductCard = ({ item, onPress }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    const fetchCustomerId = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCustomerId(user.id);
      }
    };
    fetchCustomerId();
  }, []);

  const toggleHeart = async () => {
    if (!customerId) return;

    console.log('customer id', customerId);
    console.log('product id', item.product_id);
    console.log('Item:', item);

    setLoading(true);
    try {
      if (!isFavorite) {
        const response = await axios.post(`${WISHLIST_API}/add`, {
          customer_id: customerId,
          product_id: item.product_id,
        });

        if (response.status === 201) {
          setIsFavorite(true);
        } else {
          Alert.alert('Error', 'Could not add to wishlist. Please try again.');
        }
      } else {
        const response = await axios.delete(`${WISHLIST_API}/remove`, {
          data: { customer_id: customerId, product_id: item.product_id },
        });

        if (response.status === 200) {
          setIsFavorite(false);
        } else {
          Alert.alert('Error', 'Could not remove from wishlist. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error adding/removing from wishlist:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      className="bg-gray-100 p-2 rounded-lg mr-2 mt-1 mb-1 w-[49%]"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="relative">
        <Image
          source={item.image}
          style={{ width: '100%', height: 112, borderRadius: 8 }}
          contentFit="cover"
          transition={300}
        />

        <TouchableOpacity
          className="absolute top-1 right-1 bg-gray-100 rounded-full p-1"
          onPress={(e) => {
            e.stopPropagation();
            toggleHeart();
          }}
        >
          <Icon
            name={isFavorite ? 'heart' : 'heart-o'}
            size={18}
            color={isFavorite ? '#704F38' : '#704F38'}
          />
        </TouchableOpacity>
      </View>

      <Text
        className="text-brown text-[15px] font-regular mt-2"
        numberOfLines={2}
        style={{ minHeight: 48 }}
      >
        {item.name}
      </Text>

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600 text-[14px] font-semibold">{item.price}</Text>
        <Text className="text-gray-500 text-sm mr-2">
          ⭐ {item.rating ? parseFloat(item.rating).toFixed(1) : '0.0'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
