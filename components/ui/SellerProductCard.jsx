import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

const SellerProductCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      className="bg-gray-100 p-2 rounded-lg mr-2 mt-1 mb-1 w-[49%]"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: 112, borderRadius: 8 }}
          contentFit="cover"
          transition={300}
        />
      </View>

      <Text
        className="text-brown text-[15px] font-regular mt-2"
        numberOfLines={2}
        style={{ minHeight: 44 }}
      >
        {item.name}
      </Text>
      <Text className="text-gray-500 text-[12px]">Stock: {item.stock_quantity}</Text>

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600 text-[14px] font-semibold">Rs. {item.price}</Text>
        
        <Text className="text-gray-500 text-sm mr-2">
                  ⭐ {item.rating ? parseFloat(item.rating).toFixed(1) : '0.0'}
                </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SellerProductCard;
