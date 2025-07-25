// app/orders/[orderId].js
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { ORDERS_API } from '../../config/apiConfig';
import OrderItemCard from '../../components/ui/OrderItemCard';

const OrderDetails = () => {
  const { orderId } = useLocalSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const { data } = await axios.get(`${ORDERS_API}/items/${orderId}`);
        setItems(data);
      } catch (err) {
        console.error('Failed to fetch order items:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [orderId]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
          <View className="mt-3 mb-1">
            <Text className="text-lightblack text-[28px] font-i28_semibold text-center">Order Details</Text>
          </View>

    <ScrollView className="flex-1 p-4 bg-gray-100">
      {/* <Text className="text-base font-i28_semibold mb-6">Order Number # {orderId}</Text> */}
      {loading ? (
        <Text className="flex-1 justify-center items-center">Loading items...</Text>
      ) : items.length === 0 ? (
        <Text>No items in this order.</Text>
      ) : (
        items.map((item) => <OrderItemCard key={item.order_item_id} item={item} />)
      )}
    </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetails;
