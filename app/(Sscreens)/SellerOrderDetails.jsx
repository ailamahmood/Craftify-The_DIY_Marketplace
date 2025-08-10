// app/(Sscreens)/SellerOrderDetails.js
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { SELLERORDER_API } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OrderItemCard from '../../components/ui/OrderItemCard';

const SellerOrderDetails = () => {
  const { orderId } = useLocalSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) return;
        const user = JSON.parse(userData);
        setStoreId(user.id); // For sellers, 'id' is store_id

        const { data } = await axios.get(`${SELLERORDER_API}/items/${orderId}`, {
            headers: {
              Authorization: `Bearer ${user.token}`,  // assuming user.token exists in AsyncStorage
            }
          });
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch seller order items:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [orderId]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="mt-3 mb-2">
        <Text className="text-lightblack text-[28px] font-i28_semibold text-center">Order Details</Text>
      </View>

      <ScrollView className="flex-1 p-4 bg-gray-100">
        {loading ? (
          <ActivityIndicator size="large" color="#8B4513" />
        ) : items.length === 0 ? (
          <Text>No items in this order.</Text>
        ) : (
          items.map((item) => (
            <OrderItemCard
              key={item.order_item_id}
              item={item}
              orderStatus={item.status}
              mode="seller"
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerOrderDetails;
