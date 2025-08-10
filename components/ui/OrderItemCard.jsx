// components/ui/OrderItemCard.js
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const OrderItemCard = ({ item, orderStatus, customerId, mode = 'customer' }) => {
  const router = useRouter();

  return (
    <View className="mb-3">
      <View className="flex-row bg-white rounded-xl shadow-md p-2">
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
          {item.charity_percentage > 0 && (
            <Text className="text-sm text-green-600 font-i28_regular">
              {item.charity_percentage}% goes to charity
            </Text>
          )}
          <Text className="text-sm text-lightblack mt-2 font-i28_regular">
            Subtotal: PKR {item.subtotal}
          </Text>
        </View>
      </View>

      {/* ✅ Only for customer view */}
      {mode === 'customer' && orderStatus === 'completed' && (
        <Pressable
          onPress={() =>
            router.replace({
              pathname: '/(Cscreens)/Review',
              params: {
                productId: item.product_id,
                customerId: customerId,
              },
            })
          }
          className="bg-white px-4 py-2 rounded-lg border-t border-gray-300"
        >
          <Text className="text-brown text-center font-i28_semibold text-base">
            {item.has_review ? 'Update Review' : 'Give Review'}
          </Text>
        </Pressable>
      )}

    </View>
  );
};

export default OrderItemCard;
