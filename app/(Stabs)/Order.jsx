import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import SellerActiveOrderCard from '../../components/ui/SellerActiveOrderCard';
import { useRouter } from 'expo-router';
import { SELLERORDER_API } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [token, setToken] = useState(null);

  const fetchOrders = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) throw new Error('No user data found');

      const user = JSON.parse(userData);
      const authToken = user.token;
      setToken(authToken);

      const res = await axios.get(`${SELLERORDER_API}/active`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch active orders:', err);
      Alert.alert('Error', 'Could not load active orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (orderId, action) => {
    try {
      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        return;
      }

      await axios.patch(`${SELLERORDER_API}/${orderId}/${action}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchOrders(); // Refresh the list after action
    } catch (err) {
      console.error(`Failed to ${action} order:`, err);
      Alert.alert('Error', `Failed to ${action} order.`);
    }
  };

  const handleViewDetails = (orderId) => {
    router.push({
      pathname: '(Sscreens)/SellerOrderDetails',
      params: { orderId },
    })
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <View className="bg-gray-100">
      <Text className="text-lightblack mt-12 mb-3 text-[28px] font-i28_semibold text-center">Active Orders</Text>

      <ScrollView className="p-4 mb-20" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {orders.length === 0 ? (
          <Text className="text-center text-gray-500">No active orders yet.</Text>
        ) : (
          orders.map((order) => (
            <SellerActiveOrderCard
              key={order.order_id}
              order={order}
              onAccept={() => handleAction(order.order_id, 'accept')}
              onReject={() => handleAction(order.order_id, 'reject')}
              onShip={() => handleAction(order.order_id, 'ship')}
              onViewDetails={() => handleViewDetails(order.order_id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default Order;
