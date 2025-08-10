import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, Image, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import CustomInput from "../../components/ui/CustomInput";
import CustomButton from "../../components/ui/CustomButton";
import * as ImagePicker from "expo-image-picker";
import { SELLER_API } from '../../config/apiConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

const SellerPersonalInfo = () => {
    const [sellerData, setSellerData] = useState(null);
    const [storeData, setStoreData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
  
    useEffect(() => {
      const fetchSellerData = async () => {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          Alert.alert("Session expired", "Please sign in again.");
          router.replace("/SignIn");
          return;
        }
  
        const { id } = JSON.parse(storedUser);
  
        try {
          const res = await axios.get(`${SELLER_API}/${id}`);
          setSellerData(res.data.seller);
          setStoreData(res.data.store || { store_name: "", store_description: "", store_logo: "" });
  
          setForm({
            username: res.data.seller.username,
            phone_number: res.data.seller.phone_number || "",
            store_name: res.data.store?.store_name || "",
            store_description: res.data.store?.store_description || "",
            store_logo: res.data.store?.store_logo || "",
          });
        } catch (err) {
          console.error(err);
          Alert.alert("Error", "Failed to fetch seller data");
        }
      };
  
      fetchSellerData();
    }, []);
  
    const validatePhoneNumber = (phone) => {
      const pakistaniPattern = /^03[0-9]{9}$/;
      return pakistaniPattern.test(phone);
    };
  
    const uploadLogoToCloudinary = async (uri) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", {
          uri,
          name: "store_logo.jpg",
          type: "image/jpeg",
        });
        formData.append("upload_preset", "craftify_unsigned");
        formData.append("folder", "logos");
  
        const res = await fetch("https://api.cloudinary.com/v1_1/dmeicwx5d/image/upload", {
          method: "POST",
          body: formData,
        });
  
        const data = await res.json();
        setUploading(false);
        if (data.secure_url) return data.secure_url;
        else throw new Error("Upload failed");
      } catch (err) {
        setUploading(false);
        Alert.alert("Error", "Failed to upload image");
        console.error(err);
        return null;
      }
    };
  
    const handlePickLogo = async () => {
      if (!editMode) return;
  
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Permission to access media library is required!");
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
  
      if (!result.canceled) {
        const localUri = result.assets[0].uri;
        // Upload immediately after picking
        const uploadedUrl = await uploadLogoToCloudinary(localUri);
        if (uploadedUrl) {
          setForm((prev) => ({ ...prev, store_logo: uploadedUrl }));
        }
      }
    };
  
    const handleSave = async () => {
      if (!form.username || form.username.trim() === "") {
        return Alert.alert("Invalid Username", "Username cannot be empty.");
      }
  
      if (form.phone_number && !validatePhoneNumber(form.phone_number)) {
        return Alert.alert(
          "Invalid Phone",
          "Please enter a valid Pakistani phone number starting with 03..."
        );
      }
      
  
      try {
        await axios.put(`${SELLER_API}/${sellerData.id}`, form);
        Alert.alert("Success", "Profile updated");
        setEditMode(false);
        setSellerData({ ...sellerData, username: form.username, phone_number: form.phone_number });
        setStoreData({
          store_name: form.store_name,
          store_description: form.store_description,
          store_logo: form.store_logo,
        });
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to update profile");
      }
    };
  
    if (!sellerData) return <Text className="text-center mt-10">Loading...</Text>;
  
    return (
      <SafeAreaView className="flex-1 bg-white p-2">
        <View className="mb-2">
          <Text className="text-lightblack text-[28px] font-i28_semibold text-center">
            Seller Personal & Store Info
          </Text>
        </View>
  <ScrollView showsVerticalScrollIndicator={false} >
    <View className="p-4">
        {/* Username */}
        <Text className="text-gray-700 mb-1 font-i28_regular">Username</Text>
        <CustomInput
          placeholder="Username"
          value={form.username}
          editable={editMode}
          onChangeText={(text) => setForm({ ...form, username: text })}
          containerStyles="mb-4"
          icon="person"
        />
  
        {/* Email (read-only) */}
        <Text className="text-gray-700 mb-1 font-i28_regular">Email</Text>
        <CustomInput
          placeholder="Email"
          value={sellerData.s_email}
          editable={false}
          containerStyles="mb-4 bg-gray-100"
          icon="mail"
        />
  
        {/* Phone Number */}
        <Text className="text-gray-700 mb-1 font-i28_regular">Phone Number</Text>
        <CustomInput
          placeholder="Add your phone number - 03xxxxxxxxx"
          keyboardType="phone-pad"
          containerStyles="mb-4 h-14"
          value={form.phone_number}
          editable={editMode}
          onChangeText={(text) => setForm({ ...form, phone_number: text })}
          icon="call"
        />
  
        {/* Store Name */}
        <Text className="text-gray-700 mb-1 font-i28_regular">Store Name</Text>
        <CustomInput
          placeholder="Store Name"
          value={form.store_name}
          editable={editMode}
          containerStyles="mb-4"
          onChangeText={(text) => setForm({ ...form, store_name: text })}
          icon="storefront"
        />
  
        {/* Store Description */}
        <Text className="text-gray-700 mb-1 font-i28_regular">Store Description</Text>
        <CustomInput
          placeholder="Store Description"
          value={form.store_description}
          editable={editMode}
          containerStyles="mb-4"
          onChangeText={(text) => setForm({ ...form, store_description: text })}
          icon="document-text"
          multiline
          numberOfLines={3}
        />
  
        {/* Store Logo */}
        <Text className="text-gray-700 mb-1 font-i28_regular">Store Logo</Text>
        {form.store_logo ? (
          <Image
            source={{ uri: form.store_logo }}
            style={{ width: "100%", height: 200, borderRadius: 10, marginBottom: 12 }}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-gray-500 mb-4">No logo uploaded yet.</Text>
        )}
  
        {uploading && <ActivityIndicator size="large" color="#704F38" className="mb-4" />}
  
        <CustomButton
          title={editMode ? "Change Store Logo" : "Edit Info to Change Logo"}
          onPress={handlePickLogo}
          bgColor={editMode ? "white" : "gray"}
          titleColor={editMode ? "#704F38" : "white"}
          containerStyles={editMode ? "border-2 border-[#704F38]/80 mb-6" : "mb-6"}
          disabled={!editMode || uploading}
        />
  
        <CustomButton
          title={editMode ? "Save Changes" : "Edit Info"}
          onPress={editMode ? handleSave : () => setEditMode(true)}
          bgColor={editMode ? "#704F38" : "white"}
          titleColor={editMode ? "white" : "#704F38"}
          containerStyles={editMode ? "mt-4 mb-6" : "border-2 border-[#704F38]/80 mt-4 mb-6"}
          disabled={uploading}
        />
        </View>
      </ScrollView>
      </SafeAreaView>
    );
  };
  
  export default SellerPersonalInfo;