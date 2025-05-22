import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Alert, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";
import { STORE_API } from '../../config/apiConfig';
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const Store = () => {
    const [store, setStore] = useState(null);
    const [storeName, setStoreName] = useState("");
    const [storeDescription, setStoreDescription] = useState("");
    const [storeLogo, setStoreLogo] = useState(null); // local URI
    const [uploading, setUploading] = useState(false);
    const [creating, setCreating] = useState(false);

    const router = useRouter();

    const fetchStore = async () => {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) return;

        const { id: sellerId } = JSON.parse(userData);

        try {
            const response = await fetch(`${STORE_API}/seller/${sellerId}`);
            const data = await response.json();

            if (data.exists) {
                setStore(data.store);
            }
        } catch (error) {
            console.error("Error fetching store:", error);
        }
    };

    useEffect(() => {
        fetchStore();
    }, []);

    const handlePickLogo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.cancelled) {
            setStoreLogo(result.assets[0].uri);
        }
    };

    const uploadLogoToCloudinary = async (uri) => {
        const formData = new FormData();
        formData.append("file", {
            uri,
            name: "store_logo.jpg",
            type: "image/jpeg",
        });
        formData.append("upload_preset", "craftify_unsigned"); // replace with your Cloudinary preset
        formData.append("folder", "logos");

        const res = await fetch("https://api.cloudinary.com/v1_1/dmeicwx5d/image/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        return data.secure_url;
    };

    const handleCreateStore = async () => {
        if (!storeName) return Alert.alert("Error", "Store name is required");

        setCreating(true);

        try {
            const userData = await AsyncStorage.getItem("user");
            const { id: sellerId } = JSON.parse(userData);

            let logoUrl = null;

            if (storeLogo) {
                setUploading(true);
                logoUrl = await uploadLogoToCloudinary(storeLogo);
                setUploading(false);
            }

            const response = await fetch(`${STORE_API}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    seller_id: sellerId,
                    store_name: storeName,
                    store_logo: logoUrl,
                    store_description: storeDescription,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStore(data.store);
                Alert.alert("Success", "Store created successfully!");
            } else {
                Alert.alert("Error", data.error || "Something went wrong.");
            }
        } catch (err) {
            console.error("Store creation error:", err);
            Alert.alert("Error", "Failed to create store.");
        }

        setCreating(false);
    };

    if (!store) {
        // No store: show create form
        return (
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View className="mt-10 mb-8">
                    <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Create Your Store</Text>
                </View>

                <CustomInput
                    placeholder="Store Name"
                    value={storeName}
                    onChangeText={setStoreName}
                    icon="storefront-outline"
                />

                <CustomInput
                    placeholder="Store Description"
                    value={storeDescription}
                    onChangeText={setStoreDescription}
                    icon="document-text-outline"
                />

                <CustomButton
                containerStyles="mt-4"
                    title={storeLogo ? "Change Store Logo" : "Pick Store Logo"}
                    onPress={handlePickLogo}
                />

                {storeLogo && (
                    <Image
                        source={{ uri: storeLogo }}
                        style={{ width: "100%", height: 200, marginVertical: 10, borderRadius: 10 }}
                        resizeMode="contain"
                    />
                )}

                <CustomButton
                containerStyles="mt-4"
                    title={creating ? "Creating Store..." : "Create Store"}
                    onPress={handleCreateStore}
                    disabled={creating || uploading}
                />
            </ScrollView>
        );
    }

    // Store exists: show info
    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <View className="mt-10 mb-8">
                    <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Your Store</Text>
                </View>

            {store.store_logo && (
                <Image
                    source={{ uri: store.store_logo }}
                    style={{ width: "100%", height: 200, borderRadius: 10 }}
                    resizeMode="contain"
                />
            )}

            <Text className="text-2xl text-brown font-i28_bold mt-8 text-center">{store.store_name}</Text>
            <Text className="text-gray-600 text-base font-i28_regular mt-3 text-center">{store.store_description || "No description."}</Text>

            <CustomButton
                title="View Store"
                onPress={() => router.push("/SAccount")}
                containerStyles="mt-10"
            />
        </ScrollView>
    );
};

export default Store;
