import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SellerProductList from '../../components/ui/SellerProductList';  // <-- Your seller-specific list

const Products = () => {
  return (
    <SafeAreaView className="bg-white h-full px-4">
      
      {/* Page Title */}
      <Text style={{ fontFamily: 'inknutantiqua_bold', fontSize: 28 }} className="text-lightblack mt-2">
        Craftify
        <Text className="text-brown">.</Text>
      </Text>

      {/* Product List */}
      <SellerProductList />

    </SafeAreaView>
  );
};

export default Products;
