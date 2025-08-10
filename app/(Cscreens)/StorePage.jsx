import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ProductCard from '../../components/ui/ProductCard';
import { PRODUCTS_API } from '../../config/apiConfig';
import { STORE_API } from '../../config/apiConfig';
import { CHAT_API } from '../../config/apiConfig';
import CustomButton from "../../components/ui/CustomButton";
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorePage = () => {
    const { storeId, storeName } = useLocalSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [storeDetails, setStoreDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStoreProducts();
    }, [storeId]);

    const fetchStoreProducts = async () => {
        try {
            // Get products AND store details
            const [productRes, storeRes] = await Promise.all([
                axios.get(`${PRODUCTS_API}/store/${storeId}`),
                axios.get(`${STORE_API}/store-details/${storeId}`) // You’ll need this new route
            ]);
            setProducts(productRes.data);
            setStoreDetails(storeRes.data);
        } catch (error) {
            console.error('Error fetching store products/details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChatWithSeller = async () => {
        try {
          const stored = await AsyncStorage.getItem('user');
          if (!stored) {
            alert("You must be logged in to chat.");
            return;
          }
      
          const currentUser = JSON.parse(stored); // ✅ Declare it before using
      
          console.log("Chat payload:", {
            customer_id: currentUser.id,
            seller_id: storeDetails?.seller_id,
          });
      
          const response = await axios.post(`${CHAT_API}/`, {
            customer_id: currentUser.id,
            seller_id: storeDetails?.seller_id,
          });
      
          const chat = response.data;
      
          router.replace({
            pathname: '/ChatScreen',
            params: {
              chatId: chat.chat_id,
              userId: storeDetails?.seller_id,
              name: storeDetails?.store_name,
            },
          });
      
        } catch (err) {
          console.error('Error initiating chat:', err.message);
        }
      };
      

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#8B4513" />
            </View>
        );
    }

    return (
        <View className="flex-1 px-4 pt-4 bg-white">
            {/* Pinned store name */}
            <Text className="text-lightblack mt-8 mb-4 text-[28px] font-i28_semibold text-center">{storeName}</Text>

            {/* Product List with logo and description in header */}
            <FlatList
                data={products}
                keyExtractor={(item) => item.product_id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View className="mb-4 mt-2 items-center">
                        {storeDetails?.store_logo && (
                            <Image
                                source={{ uri: storeDetails.store_logo }}
                                style={{ width: 120, height: 120, borderRadius: 50 }}
                                resizeMode="cover"
                            />
                        )}
                        {storeDetails?.store_description && (
                            <Text className="text-center font-i28_regular text-gray-600 mt-2 text-base px-2">
                                {storeDetails.store_description}
                            </Text>
                        )}
                    </View>
                )}
                renderItem={({ item }) => (
                    <ProductCard
                        item={{
                            image: { uri: item.media?.[0]?.media_url || 'https://placehold.co/400' },
                            name: item.product_name,
                            price: `PKR ${item.price}`,
                            rating: item.avg_rating,
                            product_id: item.product_id,
                        }}
                        onPress={() =>
                            router.push({
                                pathname: '(Cscreens)/ProductDetail',
                                params: { productId: item.product_id },
                            })
                        }
                    />
                )}

            />

            <View className='mt-4 mb-2'>
                <CustomButton
                    containerStyles="w-full"
                    title="Chat with Seller"
                    onPress={handleChatWithSeller}
                />
            </View>
        </View>
    );
};

export default StorePage;
