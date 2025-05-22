import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../../components/ui/CustomInput";
import ProductList from "../../components/ui/ProductList"; 
import { useRoute } from "@react-navigation/native";

const ageGroups = ["All Ages", "Kids", "Teens", "Adults"];

const Home = () => {
  const route = useRoute();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // When coming from Categories screen
  useEffect(() => {
    if (route?.params?.selectedCategoryId) {
      setSelectedCategoryId(route.params.selectedCategoryId);
    }
  }, [route]);

  const clearCategoryFilter = () => {
    setSelectedCategoryId(null);
  };

  return (
    <SafeAreaView className="bg-white h-full px-4">
      
      {/* Header */}
      <Text style={{ fontFamily: "inknutantiqua_bold", fontSize: 28 }} className="text-lightblack mt-1">
        Craftify
        <Text className="text-brown">.</Text>
      </Text>

      {/* Search Bar */}
      <View className="flex-row items-center mt-2">
        <CustomInput
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search"
        />
      </View>

      {/* Age Group Tabs */}
      <View className="h-12 mt-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center" }}
        >
          <View className="flex-row space-x-3">
            {ageGroups.map((group) => (
              <TouchableOpacity
                key={group}
                onPress={() => {
                  if (selectedAgeGroup === group) {
                    setSelectedAgeGroup(null);
                  } else {
                    setSelectedAgeGroup(group);
                  }
                }}
                className={`px-4 py-2 rounded-full border ${
                  selectedAgeGroup === group ? "bg-brown border-brown" : "border-gray-300"
                }`}
              >
                <Text
                  className={`${
                    selectedAgeGroup === group ? "text-white" : "text-gray-600"
                  } text-sm`}
                  style={{ fontFamily: "inter_18pt_medium" }}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Show "View All Products" button if a category is selected */}
      {selectedCategoryId && (
        <TouchableOpacity
          onPress={clearCategoryFilter}
          className="bg-brown py-2 px-4 rounded-full mt-4 self-start"
        >
          <Text className="text-white font-bold" style={{ fontFamily: "inter_18pt_medium" }}>
            View All Products  ✕
          </Text>
        </TouchableOpacity>
      )}

      {/* Product List */}
      <ProductList 
        searchQuery={searchQuery} 
        selectedAgeGroup={selectedAgeGroup} 
        selectedCategoryId={selectedCategoryId} 
      />
    </SafeAreaView>
  );
};

export default Home;
