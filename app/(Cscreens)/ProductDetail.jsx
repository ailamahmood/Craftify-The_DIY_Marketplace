import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator, Alert, Pressable } from 'react-native';
import ImageViewing from "react-native-image-viewing";
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import CustomButton from "../../components/ui/CustomButton";
import { PRODUCTS_API, CART_API } from '../../config/apiConfig'; // Adjust the path based on your structure
import { Video } from 'expo-av'; // Import the Video component from expo-av
import CustomDropdown from "../../components/ui/CustomDropdown"; // Import your CustomDropdown component
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ProductDetail() {
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({}); // Store selected option values
  const [customerId, setCustomerId] = useState(null);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);


  useEffect(() => {
    const fetchCustomerId = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCustomerId(user.id);  // Set customer_id from AsyncStorage
      }
    };
    fetchCustomerId();
  }, []);

  useEffect(() => {
    if (productId) {
      console.log("Product ID:", productId); // <-- Add this to check the productId
      fetchProductDetail();
    }
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      const res = await axios.get(`${PRODUCTS_API}/${productId}`);
      console.log('Product Data:', res.data); // <-- Log the response data
      const productData = res.data;

      // Set default selected options: first value of each option
      const defaultOptions = {};
      if (productData.options && productData.options.length > 0) {
        productData.options.forEach(opt => {
          if (opt.values && opt.values.length > 0) {
            defaultOptions[opt.name] = opt.values[0]; // first value as default
          }
        });
      }

      setSelectedOptions(defaultOptions); // <-- set default option selections
      setProduct(productData);
    } catch (err) {
      console.error('Error fetching product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  const handleAddToCart = async () => {
    if (!customerId) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    setLoading(true);
    try {
      const cartItem = {
        customer_id: customerId,
        product_id: productId,
        //options: selectedOptions
        //selected_options: Object.values(selectedOptions)
        selected_options: selectedOptions
      };

      const res = await axios.post(`${CART_API}/add`, cartItem);
      if (res.status === 200) {
        Alert.alert("Success", "Product added to cart!");
      } else {
        Alert.alert("Error", "Failed to add to cart. Please try again.");
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      Alert.alert("Error", "An error occurred while adding the product to the cart.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Product not found.</Text>
      </View>
    );
  }

  // Destructure safely after data is loaded
  const {
    media = [],
    product_name,
    price,
    avg_rating = 0,
    num_reviews = 0,
    reviews = [],
    description,
    stock_quantity,
    age_groups = [],
    charity_percentage,
    product_detail,
    tutorial,
    options = [],
  } = product;


  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="mb-3">
        <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Product Detail</Text>
      </View>

      <ScrollView>

        {/* Media Carousel */}
        <ScrollView className="bg-white"
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {media.length > 0 ? (
            media.map((m, idx) => (
              m.media_type === 'video' ? (
                <Video
                  key={idx}
                  source={{ uri: m.media_url }}
                  style={{ width, height: 350 }}
                  resizeMode="contain"
                  useNativeControls
                  isLooping
                  shouldPlay
                />
              ) : (
                <Image
                  key={idx}
                  source={{ uri: m.media_url }}
                  style={{ width, height: 350 }}
                  contentFit="contain"
                />
              )
            ))
          ) : (
            <Image
              source={{ uri: 'https://placehold.co/400x300' }}
              style={{ width, height: 300 }}
              contentFit="cover"
            />
          )}
        </ScrollView>

        <View className="p-5 space-y-4">

          {/* Product Name */}
          <Text className="text-xl text-brown font-i24_bold">{product_name}</Text>

          {/* Price & Rating */}
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700 text-lg font-i24_semibold">PKR {price}</Text>
            <Text className="text-lg font-i24_regular">
              ⭐ {parseFloat(avg_rating).toFixed(1)} ({num_reviews} {num_reviews === 1 ? 'rating' : 'ratings'})
            </Text>
          </View>


          {/* Description */}
          {description && (
            <View>
              <Text className="text-gray-700 text-lg font-i24_semibold mb-1">Description:</Text>
              <Text className="text-base font-i24_regular text-gray-700">{description}</Text>
            </View>
          )}

          {/* Customization Options */}
          {options.length > 0 && (
            <View>
              <Text className="text-gray-700 text-lg font-i24_semibold mb-2">Customization Options:</Text>
              {options.map((opt) => (
                <View key={opt.name}>
                  <Text className="text-gray-700 text-base text-brown font-i24_semibold mb-2">{opt.name}:</Text>
                  <CustomDropdown
                    selectedValue={selectedOptions[opt.name]}
                    onValueChange={(value) => handleOptionChange(opt.name, value)}
                    items={opt.values.map(value => ({ label: value, value }))}
                    containerStyles="w-full"
                  />
                </View>
              ))}
            </View>
          )}

          {/* Stock Quantity */}
          <View>
            <Text className="text-gray-700 text-lg font-i24_semibold mb-1">Available Stock:</Text>
            <Text className="text-base font-i24_regular text-gray-700">{stock_quantity}</Text>
          </View>

          {/* Age Groups */}
          {age_groups.length > 0 && (
            <View>
              <Text className="text-gray-700 text-lg font-i24_semibold mb-1">Recommended Age Groups:</Text>
              <Text className="text-base font-i24_regular text-gray-700">{age_groups.join(', ')}</Text>
            </View>
          )}

          {/* Charity Percentage */}
          <View>
            <Text className="text-gray-700 text-lg font-i24_semibold mb-1">Charity Contribution:</Text>
            <Text className="text-base font-i24_regular text-gray-700">{charity_percentage}% of proceeds go to charity</Text>
          </View>

          {/* Product Detail */}
          <View>
            <Text className="text-gray-700 text-lg font-i24_semibold mb-1">Detailed Information:</Text>
            <Text className="text-base font-i24_regular text-gray-700">{product_detail}</Text>
          </View>

          {/* Tutorial */}
          <View>
            <Text className="text-gray-700 text-lg font-i24_semibold mb-1">Tutorial Information:</Text>
            <Text className="text-base font-i24_regular text-gray-700 text-justify">{tutorial}</Text>
          </View>

          {/* Reviews (Placeholder) */}
          <View className="mb-10">
            <Text className="text-gray-700 text-lg font-i24_semibold mb-1">Customer Reviews:</Text>
            {reviews.filter(r => r.review_text || r.image_url).length > 0 ? (
              reviews
                .filter(r => r.review_text || r.image_url)
                .map((review, index) => (
                  <View key={index} className="bg-white p-4 mb-3 rounded-lg shadow">
                    <Text className="text-brown font-i24_semibold mb-1">{review.customer_name}</Text>
                    <Text className="text-base font-i24_regular text-gray-800 mb-1">⭐ {review.rating}</Text>
                    {review.review_text && (
                      <Text className="text-base font-i24_regular text-gray-700 mb-2">{review.review_text}</Text>
                    )}
                    {(review.image_url || review.image_url2) && (
                      <View className="relative mt-2">
                        <ScrollView
                          horizontal
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                          onScroll={e => {
                            const slide = Math.round(e.nativeEvent.contentOffset.x / 285); // match your image width
                            setCurrentSlide(slide);
                          }}
                          scrollEventThrottle={16}
                        >
                          {[review.image_url, review.image_url2]
                            .filter(Boolean)
                            .map((url, idx, array) => (
                              <Pressable
                                key={idx}
                                onPress={() => {
                                  setViewerImages(array.map(u => ({ uri: u })));
                                  setInitialIndex(idx);
                                  setIsViewerVisible(true);
                                }}
                              >
                                <Image
                                  source={{ uri: url }}
                                  style={{ width: 285, height: 200, borderRadius: 10, marginRight: 5 }}
                                  contentFit="cover"
                                />
                              </Pressable>
                            ))}
                        </ScrollView>

                        {/* Top-right 1/2 counter */}
                        <View className="absolute top-2 right-3 bg-black/60 px-2 py-0.5 rounded-xl">
                          <Text className="text-white text-xs">
                            {currentSlide + 1}/{[review.image_url, review.image_url2].filter(Boolean).length}
                          </Text>
                        </View>

                      </View>
                    )}

                  </View>
                ))
            ) : (
              <Text className="text-base font-i24_regular text-gray-700">No reviews yet. Be the first to review!</Text>
            )}
          </View>
        </View>

      </ScrollView>

      <ImageViewing
        images={viewerImages}
        imageIndex={initialIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
      />


      {/* Fixed Bottom Button */}
      <View className='mt-1 bg-gray-100 px-4 py-2 rounded-lg'>
        <CustomButton
          containerStyles="w-full"
          disabled={loading}
          title={loading ? "Adding to Cart..." : "Add to Cart"}
          onPress={handleAddToCart} // Add onPress handler
        />
      </View>

    </SafeAreaView>
  );
}
