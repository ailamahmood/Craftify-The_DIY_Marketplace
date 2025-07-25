import { useEffect, useState } from 'react';
import { View, Text, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { REVIEWS_API } from '../../config/apiConfig';
import axios from 'axios';

import CustomInput from '../../components/ui/CustomInput';
import CustomButton from '../../components/ui/CustomButton';
import { ScrollView } from 'react-native';

const Review = () => {
  const { productId, customerId } = useLocalSearchParams();
  const router = useRouter();

  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await axios.get(`${REVIEWS_API}/${customerId}/${productId}`);
        const review = res.data;

        setRating(String(review.rating));
        setReviewText(review.review_text);
        setImage1(review.image_url);
        setImage2(review.image_url2);
        setExistingReviewId(review.review_id);
      } catch (error) {
        if (error.response?.status !== 404) {
          Alert.alert('Error', 'Failed to load review.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, []);

  const uploadToCloudinary = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'review.jpg',
    });
    formData.append('upload_preset', 'craftify_unsigned');
    formData.append('folder', 'reviews');

    const res = await fetch('https://api.cloudinary.com/v1_1/dmeicwx5d/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const pickImage = async (slot) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        setUploading(true);
        const cloudUrl = await uploadToCloudinary(result.assets[0].uri);
        slot === 1 ? setImage1(cloudUrl) : setImage2(cloudUrl);
      } catch (err) {
        console.error('Upload error:', err.message);
        Alert.alert('Upload Error', 'Failed to upload image.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${REVIEWS_API}/${existingReviewId}`);
            Alert.alert('Deleted', 'Review deleted successfully.');
            router.back();
          } catch (error) {
            console.error('Delete error:', error.message);
            Alert.alert('Error', 'Failed to delete the review.');
          }
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!rating) {
      return Alert.alert('Missing Fields', 'Please enter rating.');
    }

    const reviewPayload = {
      rating: parseFloat(rating),
      review_text: reviewText,
      image_url: image1,
      image_url2: image2,
    };

    try {
      if (existingReviewId) {
        await axios.put(`${REVIEWS_API}/${existingReviewId}`, reviewPayload);
        Alert.alert('Success', 'Review updated successfully!');
      } else {
        await axios.post(`${REVIEWS_API}`, {
          ...reviewPayload,
          customer_id: customerId,
          product_id: productId,
        });
        Alert.alert('Success', 'Review submitted successfully!');
      }

      router.back();
    } catch (error) {
      console.error('Submit error:', error.message);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <ScrollView className="bg-white p-4" >
      <View className="flex-1">

        <View className="mt-7 mb-5">
          <Text className="text-lightblack mt-1 text-[24px] font-i28_semibold text-center">{existingReviewId ? 'Update your Review' : 'Rate this Product'}</Text>
        </View>

        {/* Rating input */}
        <CustomInput
          placeholder="Rating (0.5 to 5.0)"
          keyboardType="decimal-pad"
          value={rating}
          onChangeText={setRating}
        />

        {/* Review text */}
        <CustomInput
          placeholder="Write your review..."
          value={reviewText}
          onChangeText={setReviewText}
          multiline
        />

        {image1 && <Image source={{ uri: image1 }} className="w-40 h-40 mb-3 rounded" />}

        {/* Upload buttons */}
        <CustomButton
          title="Upload Image 1"
          onPress={() => pickImage(1)}
          isLoading={false}
          bgColor="white"
          titleColor="#704F38"
          containerStyles="border-2 border-[#704F38] mb-2"
        />

        {image2 && <Image source={{ uri: image2 }} className="w-40 h-40 mb-4 rounded" />}

        <CustomButton
          title="Upload Image 2"
          onPress={() => pickImage(2)}
          isLoading={false}
          bgColor="white"
          titleColor="#704F38"
          containerStyles="border-2 border-[#704F38] mb-2"
        />

        {/* Submit button */}
        <CustomButton
          title={existingReviewId ? 'Update Review' : 'Submit Review'}
          onPress={handleSubmit}
          isLoading={uploading}
          containerStyles="mt-2"
        />
      </View>

      <View className="border-t border-gray-300 my-4" />
      {existingReviewId && (
        <CustomButton
          title="Delete Review"
          onPress={handleDelete}
          bgColor={"white"}
          containerStyles="mb-14 mt-4 bg-red-100 border-2 border-red-400"
          titleColor="#B00020"
        />
      )}

    </ScrollView>
  );
};

export default Review;
