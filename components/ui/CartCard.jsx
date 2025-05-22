import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator,  } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router'; // Import useRouter
import { AntDesign, Feather } from '@expo/vector-icons'; // Icons

export default function CartCard({ product, quantity = 1, onIncrease, onDecrease, onRemove }) {
    const { product_id, product_name, price, selectedOptions = [], image_url = '' } = product;
    const imageUri = image_url && image_url.startsWith('http')
  ? image_url
  : 'https://placehold.co/100x100';
      const router = useRouter(); // Initialize router


  const handlePress = () => {
    console.log('Product pressed:', product_name);
    console.log('Product ID:', product_id);  // Log the product ID
    router.push({
      pathname: '(Cscreens)/ProductDetail',
      params: { productId: product_id },  // Pass only the product ID
    });
};

    return (
        <TouchableOpacity onPress={handlePress} >
        <View className="flex-row bg-white rounded-2xl shadow-md p-3 mb-3 relative items-center">

            {/* Left: Product Image */}
            <Image
                source={{ uri: imageUri }}
                style={{ width: 80, height: 95, borderRadius: 10 }}
                contentFit="cover"
            />

            {/* Center: Product Details */}
            <View className="flex-1 px-4">

                <Text className="text-base font-i24_semibold text-brown" numberOfLines={2}>
                    {product_name}
                </Text>

                {selectedOptions.length > 0 && (
                    <Text className="text-gray-600 text-xs font-i24_regular mt-1" numberOfLines={1}>
                        {selectedOptions.join(', ')}
                    </Text>
                )}

                <Text className="text-gray-600 text-[16px] font-i24_semibold mt-1">
                    PKR {price}
                </Text>

                {/* Quantity Controls */}
                <View className="flex-row items-center mt-2">
                    <TouchableOpacity
                        className="p-1 rounded"
                        onPress={onDecrease}
                        disabled={quantity <= 1}
                    >
                        <AntDesign name="minuscircleo" size={20} color={quantity <= 1 ? 'gray' : 'black'} />
                    </TouchableOpacity>

                    <Text className="mx-3 font-i24_medium text-base">{quantity}</Text>

                    <TouchableOpacity
                        className="p-1 rounded"
                        onPress={onIncrease}
                    >
                         <AntDesign name="pluscircleo" size={20} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
                className="absolute top-3 right-3"
                onPress={onRemove}
            >
                <Feather name="x" size={26} color="#704F38" />
            </TouchableOpacity>
        </View>
        </TouchableOpacity>
    );
}
