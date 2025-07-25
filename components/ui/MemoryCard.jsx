import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';

const MemoryCard = ({ item }) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.replace({
          pathname: '(Cscreens)/Memory',
          params: {
            product_id: item.product_id,
            product_name: item.product_name,
            order_item_id: item.order_item_id,
            memory_id: item.memory_id || '',
          },
        })
      }
      className="w-[48%] bg-white mb-4 rounded-2xl p-2 shadow-md"
    >
      <Image
        source={{
          uri: item.cover_image_url || 'https://via.placeholder.com/150',
        }}
        className="w-full h-36 rounded-lg mb-1"
        resizeMode="cover"
      />
      <Text className="text-base font-i24_semibold text-brown p-1">
        {item.product_name}
      </Text>
      {item.general_note ? (
        <Text className="text-sm font-i24_regular text-gray-500 mt-1">📝 You’ve added a memory</Text>
      ) : null}
    </Pressable>
  );
};

export default MemoryCard;
