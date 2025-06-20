import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import CustomDropdown from "../../components/ui/CustomDropdown";
import AgeGroupCheckboxes from "../../components/ui/AgeGroupCheckboxes";
import ProductOptionInput from "../../components/ui/ProductOptionInput";
import { CATEGORIES_API, MANAGEPRODUCT_API } from '../../config/apiConfig';
import CustomInput from "../../components/ui/CustomInput";
import CustomButton from "../../components/ui/CustomButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import axios from 'axios';

const uploadToCloudinary = async (uri, folder = "products", type = "image") => {
  const formData = new FormData();
  const fileExtension = uri.split('.').pop();
  const mimeType = type === "video" ? `video/${fileExtension}` : `image/${fileExtension}`;

  formData.append("file", {
    uri,
    name: `upload.${fileExtension}`,
    type: mimeType,
  });
  formData.append("upload_preset", "craftify_unsigned");
  formData.append("folder", folder);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dmeicwx5d/${type}/upload`;

  const res = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.secure_url;
};

const AddProduct = () => {
  const { control, handleSubmit, reset } = useForm();
  const [media, setMedia] = useState([]);
  const [options, setOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(CATEGORIES_API);
        const items = response.data.map((cat) => ({
          label: cat.category_name,
          value: cat.category_id,
        }));
        setCategories(items);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        Alert.alert("Error", "Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const validateFormData = (data) => {
    if (
      !data.product_name?.trim() ||
      !data.description?.trim() ||
      !data.price?.trim() ||
      !data.stock_quantity?.trim() ||
      !data.tutorial?.trim() ||
      !data.category_id ||
      !data.age_groups?.length ||
      media.length === 0
    ) {
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!validateFormData(data)) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (!media || media.length === 0) {
      Alert.alert("Validation Error", "Please add at least one image or video.");
      return;
    }

    setIsSubmitting(true);  // <-- Start loading state
    try {
      const userData = await AsyncStorage.getItem("user");
      const token = userData ? JSON.parse(userData).token : null;

      if (!token) {
        Alert.alert("Error", "User is not authenticated");
        return;
      }

      const productFolderName = `products/${uuid.v4()}`;

      const uploadedMedia = await Promise.all(
        media.map(async (m, index) => ({
          media_url: await uploadToCloudinary(m.uri, productFolderName, m.type),
          media_type: m.type,
          sort_order: index
        }))
      );

      const payload = {
        ...data,
        age_groups: data.age_groups.join(","),
        media: uploadedMedia,
        options
      };

      const res = await fetch(`${MANAGEPRODUCT_API}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      const resText = await res.text();
      let result = {};
      try {
        result = JSON.parse(resText);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
      }

      if (res.ok) {
        Alert.alert("Success", "Product added successfully!");
        reset();
        setMedia([]);
        setOptions([]);
      } else {
        Alert.alert("Error", result.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to upload");
    } finally {
      setIsSubmitting(false);  // ✅ Always turn off the spinner
    }
  };


  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true
    });

    if (!result.canceled) {
      setMedia([...media, ...result.assets.map((file) => ({ uri: file.uri, type: file.type }))]);
    }
  };

  const onRemoveMedia = (indexToRemove) => {
    setMedia(prevMedia => prevMedia.filter((_, index) => index !== indexToRemove));
  };
  

  return (
    <ScrollView className="p-4">
      <View className="mt-8 mb-5">
        <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Add New Product</Text>
      </View>

      <Controller
        control={control}
        name="product_name"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <CustomInput
            placeholder="Product Name"
            value={value}
            onChangeText={onChange}
            icon="create-outline" // optional icon
          />
        )}
      />


      <Controller
        control={control}
        name="description"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <CustomInput
            placeholder="Description"
            value={value}
            onChangeText={onChange}
            icon="document-text-outline"
          />
        )}
      />

      <Controller
        control={control}
        name="price"
        rules={{ required: true }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <CustomInput
            placeholder="Price"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            icon="cash-outline"
            error={!!error}
          />
        )}
      />


      <Controller
        control={control}
        name="stock_quantity"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <CustomInput
            placeholder="Stock Quantity"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            icon="cube-outline"
          />
        )}
      />
      <Controller
        control={control}
        name="product_detail"
        render={({ field: { onChange, value } }) => (
          <CustomInput
            placeholder="Product Details"
            value={value}
            onChangeText={onChange}
            multiline
             blurOnSubmit={false}
      returnKeyType="default"
            icon="information-circle-outline"
          />
        )}
      />

      <Controller
        control={control}
        name="tutorial"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <CustomInput
            placeholder="Tutorial Info"
            value={value}
            onChangeText={onChange}
            multiline
            icon="book-outline"
          />
        )}
      />


      <Controller
        control={control}
        name="charity_percentage"
        render={({ field: { onChange, value } }) => (
          <CustomInput
            placeholder="Charity %"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            icon="heart-outline"
          />
        )}
      />

      <Text className="text-lightblack text-base ml-1 mt-3 mb-1 font-i28_regular">Choose a Category:</Text>
      <Controller
        control={control}
        name="category_id"
        rules={{ required: 'Category is required' }}
        render={({ field: { onChange, value } }) => (
          <CustomDropdown
            selectedValue={value}
            onValueChange={onChange}
            items={categories}
          />
        )}
      />

      <Text className="text-lightblack text-base ml-1 mt-3 mb-1 font-i28_regular">Choose Age Groups:</Text>
      <Controller
        control={control}
        name="age_groups"
        defaultValue={[]}
        rules={{ validate: value => value.length > 0 || "Select at least one age group" }}
        render={({ field: { onChange, value } }) => (
          <AgeGroupCheckboxes selected={value} onChange={onChange} />
        )}
      />

      <Text className="text-lightblack text-base ml-1 mt-6 mb-1 font-i28_regular">Add Customization Options:</Text>
      <ProductOptionInput options={options} setOptions={setOptions} />

      <Text className="text-lightblack text-base ml-1 mt-6 mb-1 font-i28_regular">Add Media (Images and Videos):</Text>
      <CustomButton
        title="Select Images/Videos"
        onPress={pickMedia}
        containerStyles="w-full py-3 mt-3 mb-3 rounded-2xl border-brown/80 border-2"
        titleColor="#704F38"
        bgColor="transparent"
      />

<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {media.map((m, idx) => (
    <View key={idx} style={{ marginRight: 8, position: "relative" }}>
      <Image
        source={{ uri: m.uri }}
        style={{ width: 80, height: 80, borderRadius: 8 }}
      />
      <TouchableOpacity
  onPress={() => onRemoveMedia(idx)}
  className="absolute top-1 right-1 rounded-full w-6 h-6 flex justify-center items-center z-10" style={{ backgroundColor: "rgba(0, 0, 0, 0.47)" }}
>
  <Text className="text-white font-regular text-[22px] leading-[26px]">⨯</Text>
</TouchableOpacity>

    </View>
  ))}
</ScrollView>


      <CustomButton
  containerStyles="mt-7 mb-10"
  onPress={handleSubmit(onSubmit, (err) => {
    console.log("Validation errors:", err);
    Alert.alert("Validation failed", "Please fill all required fields properly.");
  })}
  title={isSubmitting ? "Adding..." : "Add Product"}
  isLoading={isSubmitting}
/>

      
    </ScrollView>
  );
};

export default AddProduct;
