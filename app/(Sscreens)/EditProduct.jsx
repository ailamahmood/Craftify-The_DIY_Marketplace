import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Alert,
    Pressable,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { SELLERPRODUCT_API } from "../../config/apiConfig";
import { MANAGEPRODUCT_API } from "../../config/apiConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from "expo-av";

import CustomInput from "../../components/ui/CustomInput";  // update path as needed
import CustomButton from "../../components/ui/CustomButton"; // update path as needed

const { width } = Dimensions.get('window');

export default function EditProduct() {
    const { productId } = useLocalSearchParams();
    const router = useRouter();

    const [token, setToken] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Editable fields
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stockQuantity, setStockQuantity] = useState("");
    const [productDetail, setProductDetail] = useState("");
    const [tutorial, setTutorial] = useState("");
    const [charityPercentage, setCharityPercentage] = useState("");

    // Options: [{ id, name, values: [{ id, value, deleted? }], deleted? }]
    const [options, setOptions] = useState([]);

    // Media viewing
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [initialIndex, setInitialIndex] = useState(0);

    useEffect(() => {
        async function loadUserToken() {
            try {
                const userData = await AsyncStorage.getItem('user');
                const user = userData ? JSON.parse(userData) : null;
                if (!user || !user.token) {
                    Alert.alert('Error', 'User not logged in or token missing.');
                    setLoading(false);
                    return;
                }
                setToken(user.token);
            } catch (err) {
                Alert.alert('Error', 'Failed to load user data.');
                setLoading(false);
            }
        }
        loadUserToken();
    }, []);

    useEffect(() => {
        if (token && productId) {
            fetchProductDetail();
        }
    }, [token, productId]);

    async function fetchProductDetail() {
        try {
            setLoading(true);
            const res = await axios.get(`${SELLERPRODUCT_API}/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const p = res.data;

            setProduct(p);
            setDescription(p.description || "");
            setPrice(p.price?.toString() || "");
            setStockQuantity(p.stock_quantity?.toString() || "");
            setProductDetail(p.product_detail || "");
            setTutorial(p.tutorial || "");
            setCharityPercentage(p.charity_percentage?.toString() || "");

            const opts = p.options.map((opt) => ({
                id: opt.option_name_id,
                name: opt.name,
                values: opt.values.map((v) => ({
                    id: v.id || null,
                    value: v,
                    deleted: false,
                })),
                deleted: false,
            }));

            setOptions(opts);
        } catch (err) {
            console.error("Failed to fetch product detail:", err);
            Alert.alert("Error", "Failed to load product detail");
        } finally {
            setLoading(false);
        }
    }

    // Option handlers
    function updateOptionName(idx, newName) {
        setOptions((opts) =>
            opts.map((opt, i) => (i === idx ? { ...opt, name: newName } : opt))
        );
    }

    function updateOptionValue(optIdx, valIdx, newVal) {
        setOptions((opts) =>
            opts.map((opt, i) =>
                i === optIdx
                    ? {
                        ...opt,
                        values: opt.values.map((v, vi) =>
                            vi === valIdx ? { ...v, value: newVal } : v
                        ),
                    }
                    : opt
            )
        );
    }

    function deleteOption(idx) {
        setOptions((opts) =>
            opts.map((opt, i) => (i === idx ? { ...opt, deleted: true } : opt))
        );
    }

    function addOption() {
        setOptions((opts) => [
            ...opts,
            { id: null, name: "", values: [], deleted: false },
        ]);
    }

    function addOptionValue(optIdx) {
        setOptions((opts) =>
            opts.map((opt, i) =>
                i === optIdx
                    ? {
                        ...opt,
                        values: [...opt.values, { id: null, value: "", deleted: false }],
                    }
                    : opt
            )
        );
    }

    function deleteOptionValue(optIdx, valIdx) {
        setOptions((opts) =>
            opts.map((opt, i) =>
                i === optIdx
                    ? {
                        ...opt,
                        values: opt.values.map((v, vi) =>
                            vi === valIdx ? { ...v, deleted: true } : v
                        ),
                    }
                    : opt
            )
        );
    }

    async function handleSave() {
        if (!token) {
            Alert.alert('Error', 'User not logged in or token missing.');
            return;
        }

        const payload = {
            description,
            price: parseFloat(price),
            stock_quantity: parseInt(stockQuantity, 10),
            product_detail: productDetail,
            tutorial,
            charity_percentage: parseFloat(charityPercentage),
            options: options.map((opt) => ({
                id: opt.id,
                name: opt.name,
                deleted: opt.deleted,
                values: opt.values.map((v) => ({
                    id: v.id,
                    value: v.value,
                    deleted: v.deleted,
                })),
            })),
        };

        try {
            setLoading(true);
            await axios.put(`${MANAGEPRODUCT_API}/edit/${productId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Success", "Product updated successfully");
            router.back();
        } catch (err) {
            console.error("Error updating product:", err);
            Alert.alert("Error", "Failed to update product");
        } finally {
            setLoading(false);
        }
    }

     // New delete handler
     async function handleDelete() {
        Alert.alert(
            "Confirm Delete",
            `Are you sure you want to delete "${product?.product_name}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (!token) {
                            Alert.alert('Error', 'User not logged in or token missing.');
                            return;
                        }
                        try {
                            setLoading(true);
                            await axios.delete(`${MANAGEPRODUCT_API}/delete/${productId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            Alert.alert("Deleted", "Product deleted successfully");
                            router.replace('/(Stabs)/Products'); // or wherever you want to redirect
                        } catch (err) {
                            console.error("Error deleting product:", err);
                            Alert.alert("Error", "Failed to delete product");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    }

    if (loading)
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#8B4513" />
            </View>
        );

    if (!product)
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-gray-500">Product not found.</Text>
            </View>
        );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">

            <Text className="text-lightblack mt-2 mb-4 text-[28px] font-i28_semibold text-center">Edit Product</Text>

            <ScrollView>
                {/* Media Carousel */}
                <ScrollView
                    className="bg-white"
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                >
                    {product.media.length > 0 ? (
                        product.media.map((m, idx) =>
                            m.media_type === "video" ? (
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
                                <Pressable
                                    key={idx}
                                    onPress={() => {
                                        setViewerImages([{ uri: m.media_url }]);
                                        setInitialIndex(0);
                                        setIsViewerVisible(true);
                                    }}
                                >
                                    <Image
                                        key={idx}
                                        source={{ uri: m.media_url }}
                                        style={{ width, height: 350 }}
                                        contentFit="contain"
                                    />
                                </Pressable>
                            )
                        )
                    ) : (
                        <Image
                            source={{ uri: 'https://placehold.co/400x300' }}
                            style={{ width, height: 300 }}
                            contentFit="cover"
                        />
                    )}
                </ScrollView>


                <View className="p-4">

                    <View className="mb-4">
                        <Text className="text-xl text-brown font-i28_semibold mb-1">{product.product_name}</Text>
                    </View>


                    {/* Editable Fields */}
                    <View className="mb-4">
                        <Text className="text-base font-i28_semibold mb-1">Description</Text>
                        <CustomInput
                            multiline
                            value={description}
                            onChangeText={setDescription}
                            containerStyles="mb-0"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-base font-i28_semibold mb-1">Price (PKR)</Text>
                        <CustomInput
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                            containerStyles="mb-0"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-base font-i28_semibold mb-1">Stock Quantity</Text>
                        <CustomInput
                            keyboardType="numeric"
                            value={stockQuantity}
                            onChangeText={setStockQuantity}
                            containerStyles="mb-0"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-base font-i28_semibold mb-1">Detailed Information</Text>
                        <CustomInput
                            multiline
                            value={productDetail}
                            onChangeText={setProductDetail}
                            containerStyles="mb-0"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-base font-i28_semibold mb-1">Tutorial Information</Text>
                        <CustomInput
                            multiline
                            value={tutorial}
                            onChangeText={setTutorial}
                            containerStyles="mb-0"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-base font-i28_semibold mb-1">Charity Contribution (%)</Text>
                        <CustomInput
                            keyboardType="numeric"
                            value={charityPercentage}
                            onChangeText={setCharityPercentage}
                            containerStyles="mb-0"
                        />
                    </View>

                    {/* Customization Options Editor */}
                    <View className="mb-6">
                        <Text className="text-base font-i28_semibold mb-2">Customization Options</Text>

                        {options.map((opt, optIdx) =>
                            opt.deleted ? null : (
                                <View
                                    key={optIdx}
                                    className="mb-4 p-3 bg-white border border-gray-300 rounded"
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <CustomInput
                                            placeholder="Option Name"
                                            value={opt.name}
                                            onChangeText={(text) => updateOptionName(optIdx, text)}
                                            containerStyles="flex-1 mb-0"
                                        />
                                        <Pressable
                                            onPress={() => deleteOption(optIdx)}
                                            className="ml-3 bg-red-100 border-2 border-red-400 rounded px-3 py-1"
                                        >
                                            <Text className="text-[#B00020] font-i28_semibold">Delete</Text>
                                        </Pressable>
                                    </View>

                                    {/* Option Values */}
                                    {opt.values
                                        .filter((v) => !v.deleted)
                                        .map((val, valIdx) => (
                                            <View
                                                key={valIdx}
                                                className="flex-row items-center mb-2"
                                            >
                                                <CustomInput
                                                    placeholder="Value"
                                                    value={val.value}
                                                    onChangeText={(text) =>
                                                        updateOptionValue(optIdx, valIdx, text)
                                                    }
                                                    containerStyles="flex-1 mb-0"
                                                />
                                                <Pressable
                                                    onPress={() => deleteOptionValue(optIdx, valIdx)}
                                                    className="ml-3 bg-red-100 border-2 border-red-400 rounded px-3 py-1"
                                                >
                                                    <Text className="text-[#B00020] font-i28_semibold">X</Text>
                                                </Pressable>
                                            </View>
                                        ))}

                                    <Pressable
                                        onPress={() => addOptionValue(optIdx)}
                                        className="bg-transparent rounded-2xl border-brown/80 border-2 px-5 py-2 self-start"
                                    >
                                        <Text className="text-brown font-i28_semibold">Add Value</Text>
                                    </Pressable>
                                </View>
                            )
                        )}

                        <Pressable
                            onPress={addOption}
                            className="bg-white px-4 py-2 self-center rounded-2xl border-brown/80 border-2"
                        >
                            <Text className="text-brown font-i28_semibold text-lg">+ Add Option</Text>
                        </Pressable>
                    </View>

                    {/* Save Button */}
                    <CustomButton
                        title={loading ? "Saving..." : "Save Changes"}
                        onPress={handleSave}
                        isLoading={loading}
                    />


                    <View className="border-t border-gray-300 my-4" />
                    <CustomButton
                        title="Delete Product"
                        onPress={handleDelete}
                        bgColor={"white"}
                        containerStyles="mb-14 mt-4 bg-red-100 border-2 border-red-400"
                        titleColor="#B00020"
                    />

                </View>
            </ScrollView>

            <ImageViewing
                images={viewerImages}
                imageIndex={initialIndex}
                visible={isViewerVisible}
                onRequestClose={() => setIsViewerVisible(false)}
            />
        </SafeAreaView>
    );
}
