import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MEMORY_API } from '../../config/apiConfig';
import MemoryCard from '../../components/ui/MemoryCard';  // ✅ import the 
import { useFocusEffect } from "@react-navigation/native";

const MemoryBook = () => {
  const [items, setItems] = useState([]);
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setCustomerId(user.id);
        }
      } catch (err) {
        console.error('Failed to load user from storage', err);
      }
    };
    fetchUser();
  }, []);
  

  useFocusEffect(
    useCallback(() => {
      if (!customerId) return;
  
      axios
        .get(`${MEMORY_API}/completed-items/${customerId}`)
        .then((res) => setItems(res.data))
        .catch((err) => console.error('Error fetching completed items:', err));
    }, [customerId])
  );
  

  if (!customerId) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="mt-3 mb-2">
        <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Memory Book</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View className="flex flex-wrap flex-row justify-between">
          {items.map((item) => (
            <MemoryCard key={item.order_item_id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MemoryBook;
