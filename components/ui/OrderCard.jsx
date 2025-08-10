import { View, Text, Pressable } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';

const statusColors = {
  pending: 'bg-yellow-200 text-yellow-800',
  accepted: 'bg-blue-200 text-blue-800',
  rejected: 'bg-red-200 text-red-800',
  shipped: 'bg-orange-200 text-red-800',
  completed: 'bg-green-200 text-green-800',
};

const OrderCard = ({ order }) => {
  const router = useRouter();

  const {
    order_id,
    order_date,
    total_amount,
    shipping_address,
    status,
    store_name,
    charity_amount,
  } = order;

  const statusClass =
    'px-4 py-2 text-xs font-i28_semibold rounded-full ' +
    (statusColors[status] || 'bg-gray-200 text-gray-700');

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '(Cscreens)/OrderDetails',
          params: { orderId: order_id },
        })
      }
    >
      <View className="flex-row bg-white p-4 rounded-2xl shadow mb-3">
        {/* Left: order info */}
        <View className="flex-1 pr-3">
          <Text className="text-lg font-i28_semibold text-brown mb-1">{store_name}</Text>
          <Text className="text-sm font-i28_regular text-gray-600 mb-1">
            {format(new Date(order_date), 'dd MMM yyyy, hh:mm a')}
          </Text>
          <Text className="text-base font-i28_regular text-gray-800">Amount: Rs {total_amount}</Text>
          {charity_amount > 0 && (
            <Text className="text-sm font-i28_regular text-green-700">
              Charity: Rs {Math.round(charity_amount)}
            </Text>
          )}
          <Text className="text-xs font-i28_regular text-gray-500 mt-2">Ship: {shipping_address}</Text>
        </View>

        {/* Right: status */}
        <View className="justify-center items-end">
          <Text className={statusClass}>
            {status}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default OrderCard;