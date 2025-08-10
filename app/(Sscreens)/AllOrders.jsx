import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import axios from 'axios';
import SellerOrderCard from '../../components/ui/SellerOrderCard';
import { SELLERORDER_API } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setToken(user.token);
                }
            } catch (err) {
                console.error('Failed to load token from storage', err);
            }
        };
        fetchToken();
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchOrders = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${SELLERORDER_API}/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Map to match the `SellerOrderCard` props
                const formattedOrders = data.map(order => ({
                    ...order,
                    customer_name: order.customer_username // renaming for card
                }));
                setOrders(formattedOrders);
            } catch (err) {
                console.error('Error fetching seller orders:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    if (!token) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
                    <ActivityIndicator size="large" color="#8B4513" />
                  </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 px-4 mb-2">
            <Text className="text-lightblack mt-8 mb-6 text-[28px] font-i28_semibold text-center">My Orders</Text>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#704F38" />
                </View>
            ) : orders.length === 0 ? (
                <Text className="text-center font-i28_regular text-gray-500 mt-10">No orders found.</Text>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {orders.map((order) => (
                        <SellerOrderCard key={order.order_id} order={order} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default AllOrders;
