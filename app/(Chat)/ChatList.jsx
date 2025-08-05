import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { CHAT_API } from '../../config/apiConfig';
import { Ionicons } from '@expo/vector-icons';
import useSocket from '../../hooks/useSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const socket = useSocket();
  const router = useRouter();

  // Step 1: Load user data from AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user'); // assuming you store { id, role } object
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserId(user.id);
          setRole(user.role);
        }
      } catch (error) {
        console.error('Error loading user from AsyncStorage:', error);
      }
    };

    fetchUser();
  }, []);


  // Step 2: Fetch chats after userId and role are loaded
  useEffect(() => {
    if (!userId || !role) return;
    console.log(userId); console.log(role);

    const fetchChats = async () => {
      try {
        const { data } = await axios.get(`${CHAT_API}/${userId}?type=${role}`);

        setChats(data);
      } catch (err) {
        console.error('Error fetching chats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userId, role]);

  useEffect(() => {
    if (!socket) return;

    const refresh = () => fetchChats();

    socket.on("messageReceived", refresh);
    socket.on("messageRead", refresh); // <--- Listen to message read updates too

    return () => {
      socket.off("messageReceived", refresh);
      socket.off("messageRead", refresh);
    };
  }, [socket]);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }


  const renderChatItem = ({ item }) => {
    const isCustomer = role === 'Customer';
    const name = isCustomer ? item.store_name : item.customer_name;
    const image = isCustomer ? item.store_logo : item.profile_image;
    const chatPartnerId = isCustomer ? item.seller_id : item.customer_id;

    console.log(item.store_name); console.log(item.store_logo);

    return (
      <Pressable
        onPress={() =>
          router.replace({
            pathname: '/ChatScreen',
            params: {
              chatId: item.chat_id,
              userId: chatPartnerId,
              name,
              image,
            },
          })
        }
        className="px-8 py-4 border-b border-gray-200"
      >
        <Text className="text-lg font-i28_semibold text-brown font-semibold">{name}</Text>
        <View className="flex-row items-center space-x-2 mt-1">
          {item.latest_message_type === 'image' ? (
            <>
              <Ionicons name="image-outline" size={18} color="#555" />
              <Text className="text-base font-i28_regular text-gray-600" numberOfLines={1}>
                 Image
              </Text>
            </>
          ) : (
            <Text className="text-base mt-1 font-i28_regular text-gray-600" numberOfLines={2}>
              {item.latest_message || 'No messages yet'}
            </Text>
          )}
        </View>


        {item.unread_count > 0 && (
          <Text className="text-xs mt-1 text-red-500 font-bold">{item.unread_count} unread message</Text>
        )}

      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="mb-2 mt-10">
        <Text className="text-lightblack text-[28px] font-i28_semibold text-center">Your Chats</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.chat_id}
        renderItem={renderChatItem}
      />
    </View>
  );
};

export default ChatList;
