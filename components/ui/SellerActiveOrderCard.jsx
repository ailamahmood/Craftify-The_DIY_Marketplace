import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { format } from 'date-fns';
import CustomButton from '../ui/CustomButton';

const buttonStyles = {
  accept: 'bg-green-200 text-green-800',
  reject: 'bg-red-200 text-red-800',
  ship: 'bg-orange-200 text-orange-800',
};

const statusColors = {
  pending: 'bg-yellow-200 text-yellow-800',
  accepted: 'bg-blue-200 text-blue-800',
  shipped: 'bg-orange-200 text-red-800',
};

const SellerOrderCard = ({ order, onAccept, onReject, onShip, onViewDetails }) => {
  const handleAccept = () => {
    Alert.alert(
      'Confirm Accept',
      'Are you sure you want to accept this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: () => onAccept(order.order_id),
        },
      ],
      { cancelable: true }
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Confirm Reject',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => onReject(order.order_id),
        },
      ],
      { cancelable: true }
    );
  };

  const handleShip = () => {
    Alert.alert(
      'Confirm Shipping',
      'Mark this order as shipped?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ship',
          style: 'default',
          onPress: () => onShip(order.order_id),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="bg-white p-4 rounded-2xl shadow mb-6">
      <Text className="text-sm font-i28_regular text-lightblack mb-1">Order ID: {order.order_id}</Text>
      <Text className="text-lg font-i28_semibold text-brown mb-1 mt-2">Order by: {order.customer_username}</Text>
      <Text className="text-sm font-i28_regular text-gray-800 mb-1">{order.customer_email}</Text>
      <Text className="text-sm font-i28_regular text-gray-800 mb-1">Phone: {order.phone_number}</Text>
      <Text className="text-sm font-i28_regular text-gray-800 mb-1">
        {format(new Date(order.order_date), 'dd MMM yyyy, hh:mm a')}
      </Text>
      <Text className="text-sm font-i28_regular text-gray-800">Ship: {order.shipping_address}</Text>
      <Text className="text-base font-i28_regular text-lightblack mb-2 mt-2">Amount: Rs {order.total_amount}</Text>
      
      <Text className="text-base font-i28_regular text-lightblack mb-1">
        Status: <Text className={`${statusColors[order.status]} px-2 py-1 rounded-full`}>  {order.status}  </Text>
      </Text>

      {/* Action Buttons */}
      <View className="flex-row flex-wrap gap-2 mt-2">
        {order.status === 'pending' && (
          <>
            <Pressable
              onPress={handleAccept}
              className={`${buttonStyles.accept} px-6 py-3 m-2 rounded-full`}
            >
              <Text className="font-i28_semibold text-sm">Accept</Text>
            </Pressable>

            <Pressable
              onPress={handleReject}
              className={`${buttonStyles.reject} px-6 py-3 m-2 rounded-full`}
            >
              <Text className="font-i28_semibold text-sm">Reject</Text>
            </Pressable>
          </>
        )}

        {order.status === 'accepted' && (
          <Pressable
            onPress={handleShip}
            className={`${buttonStyles.ship} px-6 py-3 m-2 rounded-full`}
          >
            <Text className="font-i28_semibold text-sm">Mark as Shipped</Text>
          </Pressable>
        )}
      </View>

      {/* View Details Button */}
      <View className="mt-5">
        <CustomButton title="View Details" onPress={() => onViewDetails(order.order_id)} />
      </View>
    </View>
  );
};

export default SellerOrderCard;
