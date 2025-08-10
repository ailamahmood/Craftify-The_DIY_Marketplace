import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import AccountOption from "../../components/ui/AccountOption";

const SAccount = () => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                Alert.alert("Session Expired", "Please sign in again.");
                router.replace("/SignIn");
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem("user");
        router.replace("/SignIn");
    };

    return (
        <View className="flex-1 bg-white">
            {user ? (
                <ScrollView>


                    <View className="mt-12">
                        <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">My Account</Text>
                    </View>

                    <View className="items-center mt-2 mb-4">
                        <Text className="text-base text-gray-500 font-i28_regular">Welcome, {user.username}!</Text>
                        <Text className="text-gray-500">Role: {user.role}</Text>
                    </View>


                    <AccountOption
                        icon="user-circle"
                        title="Personal Info"
                        subtitle="Edit your account information"
                        onPress={() => router.push("/SellerPersonalInfo")}
                    />

                    <AccountOption
                        icon="dropbox"
                        title="My Orders"
                        subtitle="View all your orders"
                        onPress={() => router.push("/AllOrders")}
                    />

                    <AccountOption
                        icon="comments"
                        title="My Chats"
                        subtitle="See chats of customers"
                        onPress={() => router.push("/ChatList")}
                    />

                    <AccountOption
                        icon="building"
                        title="Charitable Organizations"
                        subtitle="View partnered org. and charity details"
                        onPress={() => router.push("/CharityScreen")}
                    />

                    <AccountOption
                        icon="question-circle"
                        title="FAQ"
                        subtitle="Frequently asked questions"
                        onPress={() => router.push("/FAQ")}
                    />

                    <TouchableOpacity
                        className="items-center mt-6"
                        onPress={() => {
                            Alert.alert(
                                "Confirm Logout",
                                "Are you sure you want to log out?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Log Out",
                                        style: "destructive",
                                        onPress: handleLogout,
                                    },
                                ],
                                { cancelable: true }
                            );
                        }}
                    >
                        <Text className="text-red-600 font-i28_semibold text-base">Log Out</Text>
                    </TouchableOpacity>


                </ScrollView>
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Text className="font-i28_regular">Loading...</Text>
                </View>
            )}
        </View>

    );
};

export default SAccount;