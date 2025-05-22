import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

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

    return (
        <View className="flex-1 justify-center items-center bg-white">
            {user ? (
                <>
                    <Text className="text-2xl font-semibold">Welcome, {user.username}!</Text>
                    <Text className="text-gray-500">Role: {user.role}</Text>
                </>
            ) : (
                <Text>Loading...</Text>
            )}

            <TouchableOpacity 
                className="bg-red-500 py-2 px-6 mt-10 rounded-lg"
                onPress={async () => {
                    await AsyncStorage.removeItem("user");
                    router.replace("/SignIn");
                }}
            >
                <Text className="text-white font-semibold">Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SAccount;