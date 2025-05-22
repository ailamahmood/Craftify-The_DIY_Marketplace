import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import ProductCard from './ProductCard';
import { PRODUCTS_API } from '../../config/apiConfig';
import axios from 'axios';
import { useRouter } from 'expo-router';  // <-- Import useRouter from expo-router

const ProductList = ({ searchQuery, selectedAgeGroup, selectedCategoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize useRouter hook
  const router = useRouter();  // <-- Use it here

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedAgeGroup, selectedCategoryId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = {};

      // --- AGE GROUP LOGIC ---
      if (selectedAgeGroup) {
        switch (selectedAgeGroup) {
          case 'Kids':
            queryParams.age_group = ['kids', 'all'];
            break;
          case 'Teens':
            queryParams.age_group = ['teens', 'all'];
            break;
          case 'Adults':
            queryParams.age_group = ['adults', 'all'];
            break;
          case 'All Ages':
            queryParams.age_group = ['all'];
            break;
          default:
            break; // no filter
        }
      }

      // CATEGORY FILTER
      if (selectedCategoryId && selectedCategoryId !== 'All') {
        queryParams.category_id = selectedCategoryId;
      }

      // SEARCH FILTER (if implemented in backend)
      if (searchQuery) {
        queryParams.search = searchQuery;
      }

      const res = await axios.get(PRODUCTS_API, { params: queryParams });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    
    <ProductCard
      item={{
        image: { uri: item.media?.[0]?.media_url || 'https://placehold.co/400' },
        name: item.product_name,
        price: `PKR ${item.price}`,
        rating: item.avg_rating,
        product_id: item.product_id,
      }}
      // Now the onPress is handled by the router hook
      onPress={() => {
        console.log('Product pressed:', item.product_name);
        console.log('Product ID:', item.product_id);  // Log the product ID
        console.log('Rating:', item.avg_rating); 
        router.push({
          pathname: '(Cscreens)/ProductDetail',
          params: { productId: item.product_id },  // <-- Only pass ID
        });
      }}
      
    />
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (!products.length) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">No products found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 mt-2">
      <FlatList
        data={products}
        keyExtractor={(item) => item.product_id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ProductList;
