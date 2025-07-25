import React, { useEffect, useState } from "react";
import { Pressable, View, Text, TextInput, Image, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MEMORY_API } from "../../config/apiConfig";
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";

const Memory = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    product_id,
    product_name,
    order_item_id,
    memory_id: memoryIdFromParam,
    general_note,
  } = params;

  const [note, setNote] = useState(general_note || "");
  const [memory, setMemory] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);


  const fetchMemory = async () => {
    if (!memoryIdFromParam) return;
    try {
      const res = await axios.get(`${MEMORY_API}/entry/${memoryIdFromParam}`);
      setMemory(res.data);
      setNote(res.data.general_note || "");
      setImages(res.data.images || []);
    } catch (err) {
      console.error("Failed to load memory:", err.message);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const saveNote = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      const { id: customer_id } = JSON.parse(user);

      const payload = {
        customer_id,
        order_item_id,
        product_id,
        general_note: note,
      };

      const res = await axios.post(`${MEMORY_API}`, payload);
      setMemory(res.data);

      // Save image notes AFTER saving the memory note
      await Promise.all(
        images.map((img) =>
          axios.put(`${MEMORY_API}/image/${img.memory_image_id}`, {
            image_note: img.image_note || "",
          })
        )
      );

      Alert.alert("Saved", "Memory and notes saved!");
    } catch (err) {
      console.error("Save note error:", err);
      Alert.alert("Error", "Failed to save note.");
    }
  };


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "memory.jpg",
    });
    formData.append("upload_preset", "craftify_unsigned");
    formData.append("folder", "memory");

    const res = await fetch("https://api.cloudinary.com/v1_1/dmeicwx5d/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleImageUpload = async (localUri) => {
    if (!memory?.memory_id) return Alert.alert("Error", "Save the memory note first.");

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(localUri);
      const res = await axios.post(`${MEMORY_API}/${memory.memory_id}/image`, {
        image_url: imageUrl,
      });
      setImages(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Image upload error:", err.message);
      Alert.alert("Error", "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const updateImageNote = async (imageId, note) => {
    try {
      const res = await axios.put(`${MEMORY_API}/image/${imageId}`, {
        image_note: note,
      });

      setImages(prev =>
        prev.map(img => img.memory_image_id === imageId ? res.data : img)
      );
    } catch (err) {
      console.error("Update image note error:", err.message);
    }
  };

  const confirmDeleteImage = (imageId) => {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteImage(imageId),
      },
    ]);
  };

  const deleteImage = async (imageId) => {
    try {
      await axios.delete(`${MEMORY_API}/image/${imageId}`);
      setImages((prev) => prev.filter((img) => img.memory_image_id !== imageId));
    } catch (err) {
      console.error("Delete image error:", err.message);
      Alert.alert("Error", "Failed to delete image.");
    }
  };


  const confirmDeleteMemory = () => {
    Alert.alert(
      "Delete Memory",
      "Are you sure you want to delete the entire memory and all images?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMemory(),
        },
      ]
    );
  };

  const deleteMemory = async () => {
    try {
      await axios.delete(`${MEMORY_API}/${memory.memory_id}`);
      Alert.alert("Deleted", "Memory deleted successfully.");
      router.back(); // go back to MemoryBook screen
    } catch (err) {
      console.error("Delete memory error:", err.message);
      Alert.alert("Error", "Failed to delete memory.");
    }
  };


  return (

    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="mt-3 mb-2">
        <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Your Memories</Text>
      </View>

      <ScrollView className="p-4">
        <Text className="text-[24px] text-brown font-i24_semibold text-center mb-4">{product_name}</Text>

        <CustomInput
          placeholder="Write your memory note here..."
          value={note}
          onChangeText={setNote}
          multiline={true}
          containerStyles="h-32 mb-8"
        />


        <View className="gap-4">
          {images.map((img) => (
            <View key={img.memory_image_id} className="mb-4 relative">
              <Image
                source={{ uri: img.image_url }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 10,
                  backgroundColor: "black",
                }}
                resizeMode="contain"
              />

              {/* Delete button top-right */}
              <TouchableOpacity
                onPress={() => confirmDeleteImage(img.memory_image_id)}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  padding: 6,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="trash" size={20} color="white" />
              </TouchableOpacity>

              <CustomInput
                placeholder="Add image note..."
                value={img.image_note || ""}
                onChangeText={(text) => {
                  setImages((prev) =>
                    prev.map((image) =>
                      image.memory_image_id === img.memory_image_id
                        ? { ...image, image_note: text }
                        : image
                    )
                  );
                }}
                multiline={true}
                containerStyles="mt-2"
              />
            </View>

          ))}
        </View>

        <Pressable
          onPress={pickImage}
          disabled={uploading}
          className="w-full h-48 border-2 border-[#704F38] rounded-xl justify-center items-center mt-4 mb-6 relative bg-white">
          {/* Centered large + icon */}
          <Ionicons name="add" size={48} color="#704F38" />

          {/* Upload Image text in bottom right */}
          <View className="absolute bottom-2 right-2">
            <Text className="text-[#704F38] text-base font-i24_semibold">
              {uploading ? "Uploading..." : "Upload Memory "}
            </Text>
          </View>
        </Pressable>

        <CustomButton
          title="Save Note"
          onPress={saveNote}
          containerStyles="mb-4"
        />

        <View className="border-t border-gray-300 my-4" />
        <CustomButton
          title="Delete Entire Memory"
          onPress={confirmDeleteMemory}
          bgColor={"white"}
          containerStyles="mb-14 mt-4 bg-red-100 border-2 border-red-400"
          titleColor="#B00020"
        />

      </ScrollView>
    </SafeAreaView>
  );
};

export default Memory;
