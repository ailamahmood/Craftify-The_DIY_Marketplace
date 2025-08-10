import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";  // import CustomInput
import axios from 'axios';
import { CHECKOUT_API, CART_API, CUSTOMER_API } from '../../config/apiConfig';
import { useRouter } from 'expo-router';

const CheckoutScreen = () => {
    const [customerId, setCustomerId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [charityTotal, setCharityTotal] = useState(0);

    // User profile info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const router = useRouter();

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

    useEffect(() => {
        if (customerId) {
            fetchCartItems();
            fetchUserProfile();
        }
    }, [customerId]);

    const fetchUserProfile = async () => {
        try {
            const res = await axios.get(`${CUSTOMER_API}/${customerId}`);
            setName(res.data.username || '');
            setEmail(res.data.c_email || '');
            setPhone(res.data.phone_number || '');
            setAddress(res.data.address || '');
        } catch (err) {
            console.error('Error fetching profile:', err);
            Alert.alert('Error', 'Could not load profile info');
        }
    };

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${CART_API}/${customerId}`);
            setCartItems(response.data);

            let totalAmount = 0;
            let totalCharity = 0;

            response.data.forEach(item => {
                const itemTotal = item.price * item.quantity;
                const charityPercent = parseFloat(item.charity_percentage || 0); // Ensure numeric
                const itemCharity = itemTotal * (charityPercent / 100);

                totalAmount += itemTotal;
                totalCharity += itemCharity;
            });

            setTotal(totalAmount);
            setCharityTotal(totalCharity);
        } catch (error) {
            console.error('Error fetching cart:', error);
            Alert.alert('Error', 'Could not load cart items.');
        } finally {
            setLoading(false);
        }
    };


    const validatePhoneNumber = (phone) => {
        const pakistaniPattern = /^03[0-9]{9}$/;
        return pakistaniPattern.test(phone);
    };

    const handleCheckout = async () => {
        if (!phone || !address) {
            return Alert.alert('Validation Error', 'Please provide phone number and address.');
        }
        if (!validatePhoneNumber(phone)) {
            return Alert.alert('Invalid Phone', 'Please enter a valid Pakistani phone number starting with 03...');
        }

        try {
            setLoading(true);
            await axios.post(CHECKOUT_API, {
                customer_id: customerId,
                customer_name: name,
                customer_email: email,
                shipping_address: address,
                phone_number: phone,
            });

            Alert.alert('Success', 'Your order has been placed successfully!');
            router.replace('/Home');
        } catch (error) {
            console.error('Checkout error:', error);
            Alert.alert('Error', 'Failed to complete checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#8B4513" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100 p-4">
            <View className="mb-2">
                <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Checkout</Text>
            </View>
            <ScrollView>

                {/* Name (read-only) */}
                <Text className="mt-4 mb-2 text-base font-i28_semibold">Full Name</Text>
                <CustomInput
                    placeholder="Name"
                    value={name}
                    editable={false}
                    containerStyles="mb-4 bg-gray-200"
                    icon="person"
                />

                {/* Name (read-only) */}
                <Text className="mb-2 text-base font-i28_semibold">Email</Text>
                <CustomInput
                    placeholder="Email"
                    value={email}
                    editable={false}
                    containerStyles="mb-4 bg-gray-200"
                    icon="mail"
                />

                {/* Phone Number: use CustomInput */}
                <Text className="mb-2 text-base font-i28_semibold">Phone Number</Text>
                <CustomInput
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    containerStyles="mb-4"
                    icon="call"
                />

                {/* Shipping Address: use CustomInput with multiline */}
                <Text className="mb-2 text-base font-i28_semibold">Shipping Address</Text>
                <CustomInput
                    placeholder="Enter shipping address"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    containerStyles="mb-4"
                    icon="home"
                    inputStyles="h-20 text-start" // tall input for multiline
                />

                {/* Order Summary */}
                <View className="mb-6">
                    <Text className="text-lg font-i28_semibold mb-2">Order Summary</Text>
                    {cartItems.map((item, index) => (
                        <View key={index} className="bg-white p-4 rounded-xl mb-3 border border-gray-200">
                            <Text className="text-base font-i28_semibold">{item.product_name}</Text>

                            {item.selected_options && (
                                <View className="mt-1">
                                    {Object.entries(item.selected_options).map(([optionName, optionValue]) => (
                                        <Text key={optionName} className="text-sm text-gray-600 font-i28_regular">
                                            {optionName}: {optionValue}
                                        </Text>
                                    ))}
                                </View>
                            )}

                            <Text className="mt-1 text-sm text-gray-800 font-i28_regular">Quantity: {item.quantity}</Text>
                            <Text className="mt-1 text-sm text-gray-800 font-i28_regular">Price: PKR {item.price}</Text>

                            {/* Show charity percentage if applicable */}
                            {item.charity_percentage > 0 && (
                                <Text className="mt-1 text-sm text-green-600 font-i28_regular">
                                    Charity: {item.charity_percentage}% of this item goes to charity
                                </Text>
                            )}
                        </View>
                    ))}

                </View>
            </ScrollView>

            <View className="p-2">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm font-i28_regular text-gray-700">Charity Contribution:</Text>
                    <Text className="text-base font-i28_regular text-green-700">PKR {charityTotal.toFixed(2)}</Text>
                </View>

                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-i28_semibold">Total Amount:</Text>
                    <Text className="text-lg font-i28_semibold">PKR {total.toFixed(2)}</Text>
                </View>

                <CustomButton
                    containerStyles="w-full"
                    disabled={loading}
                    title={loading ? "Placing Order..." : "Place Order"}
                    onPress={handleCheckout}
                />
            </View>

        </SafeAreaView>
    );
};

export default CheckoutScreen;
