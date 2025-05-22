// screens/CategoriesScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import CategoryCard from '../../components/ui/CategoryCard'; // adjust path as needed
import { SafeAreaView } from "react-native-safe-area-context";
import { CATEGORIES_API } from '../../config/apiConfig';
import { useNavigation } from '@react-navigation/native';

const Category = () => {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_API);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (

    <SafeAreaView className="h-full bg-gray-100">

      <View className="mt-5 mb-5">       
          <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Categories</Text>
      </View>

      <ScrollView className="px-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.category_id}
            image={category.category_image}
            name={category.category_name}
            onPress={() => {
              navigation.navigate('Home', { selectedCategoryId: category.category_id }); // 👈 Pass category id
            }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Category;
