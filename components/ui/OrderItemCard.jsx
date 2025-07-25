// components/OrderItemCard.js
import { View, Text, Image } from 'react-native';

const OrderItemCard = ({ item }) => {
  return (
    <View className="flex-row bg-white rounded-xl shadow-md mb-3 p-2">
      <Image
        source={{ uri: item.cover_image_url }}
        className="w-20 h-26 rounded-lg mr-4"
      />
      <View className="flex-1 justify-between">
        <Text className="text-base font-i28_semibold text-brown mb-1">{item.product_name}</Text>
        <Text className="text-sm font-i28_regular text-gray-500">
          Quantity: {item.quantity}
        </Text>
        {item.selected_options && (
          <View>
            {Object.entries(item.selected_options).map(([optionName, optionValue]) => (
              <Text key={optionName} className="text-sm text-gray-600 font-i28_regular">
                {optionName}: {optionValue}
              </Text>
            ))}
          </View>
        )}
        <Text className="text-sm text-gray-600 font-i28_regular">
          Price Each: PKR {item.price_each}
        </Text>
        <Text className="text-sm text-lightblack mt-2 font-i28_regular">Subtotal: PKR {item.subtotal}</Text>




      </View>
    </View>
  );
};

export default OrderItemCard;
