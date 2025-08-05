import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ProductCard from '../../components/ui/ProductCard';
import { PRODUCTS_API } from '../../config/apiConfig';
import CustomButton from "../../components/ui/CustomButton";

const StorePage = () => {
    const { storeId, storeName } = useLocalSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStoreProducts();
    }, [storeId]);

    const fetchStoreProducts = async () => {
        try {
            const res = await axios.get(`${PRODUCTS_API}/store/${storeId}`);
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching store products:', error);
        } finally {
            setLoading(false);
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

            <View className="mt-4 mb-2">
                <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">{storeName}</Text>
            </View>

            <FlatList
                data={products}
                keyExtractor={(item) => item.product_id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
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

            {/* Fixed Bottom Button */}
            <View className='mt-1 mb-2 py-2'>
                <CustomButton
                    containerStyles="w-full"
                    disabled={loading}
                    title={loading ? "Opening Chat..." : "Chat with Seller"}
                    onPress={() =>
                        router.push("/ChatTest")
                      }
                />
            </View>

        </View>

    );
};

export default StorePage;
