import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import OrderCard from '../../components/ui/OrderCard';
import { ORDERS_API } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customerId, setCustomerId] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setCustomerId(user.id);
                }
            } catch (err) {
                console.error('Failed to load user from storage', err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!customerId) return;

        const fetchOrders = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${ORDERS_API}/${customerId}`);
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [customerId]);

    if (!customerId) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Loading user data...</Text>
            </View>
        );
    }



    return (
        <View className="flex-1 bg-gray-50 px-4 pt-6 mt-3 mb-2">
            <Text className="text-lightblack mt-2 mb-6 text-[28px] font-i28_semibold text-center">My Orders</Text>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#704F38" />
                      </View>
            ) : orders.length === 0 ? (
                <Text className="text-center font-i28_regular text-gray-500 mt-10">No orders found.</Text>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {orders.map((order) => (
                        <OrderCard key={order.order_id} order={order} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default MyOrders;
