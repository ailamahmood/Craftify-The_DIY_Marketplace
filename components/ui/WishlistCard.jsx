import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { WISHLIST_API } from '../../config/apiConfig'; // Adjust the path based on where your api.js is
import { useRouter } from 'expo-router'; // Import useRouter

export default function WishlistCard({ product, onRemove }) {
    const { product_id, product_name, price, rating = 4.5, media_urls = [], customer_id } = product;
    const firstImage = media_urls.length > 0 ? media_urls[0] : 'https://placehold.co/100x100';
    const [loading, setLoading] = useState(false); // loading state for remove action
    const router = useRouter(); // Initialize router

    const handleRemove = async () => {
        try {
            setLoading(true);
            await axios.delete(`${WISHLIST_API}/remove`, {
                data: { customer_id, product_id }
            });
            setLoading(false);
            if (onRemove) {
                onRemove(product_id); // Tell parent to remove from UI
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            setLoading(false);
            Alert.alert('Error', 'Could not remove from wishlist. Please try again.');
        }
    };

    const handlePress = () => {
        console.log('Product pressed:', product_name);
        console.log('Product ID:', product_id);  // Log the product ID
        router.push({
          pathname: '(Cscreens)/ProductDetail',
          params: { productId: product_id },  // Pass only the product ID
        });
    };

    return (
        <TouchableOpacity onPress={handlePress} disabled={loading}>
            <View className="flex-row bg-white rounded-2xl shadow-md p-2 mb-3 items-center">
                {/* Left: Product Image */}
                <Image
                    source={{ uri: firstImage }}
                    style={{ width: 84, height: 98, borderRadius: 10 }}
                    contentFit="cover"
                />

                {/* Center: Name, Rating, Price */}
                <View className="flex-1 px-4">
                    <Text className="text-base font-i24_semibold text-brown" numberOfLines={2}>
                        {product_name}
                    </Text>
                    <Text className="text-gray-600 text-sm font-i24_regular mt-1">
                        ⭐ {rating}
                    </Text>
                    <Text className="text-gray-600 text-base font-i24_semibold mt-1">
                        PKR {price}
                    </Text>
                </View>

                {/* Right: Heart Icon OR Spinner */}
                <TouchableOpacity onPress={handleRemove} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#704F38" />
                    ) : (
                        <Icon
                            name="heart" // Always filled heart
                            size={26}
                            color="#704F38"
                        />
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
