import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CUSTOMER_API } from '../../config/apiConfig';
import { useRouter } from "expo-router";
import CustomInput from "../../components/ui/CustomInput";
import CustomButton from "../../components/ui/CustomButton";

const PersonalInfo = () => {
    const [userData, setUserData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            if (!storedUser) {
                Alert.alert("Session expired", "Please sign in again.");
                router.replace("/SignIn");
                return;
            }

            const { id } = JSON.parse(storedUser);
            try {
                const res = await axios.get(`${CUSTOMER_API}/${id}`);
                setUserData(res.data);
                setForm({
                    username: res.data.username,
                    phone_number: res.data.phone_number || "",
                    address: res.data.address || "",
                });
            } catch (err) {
                console.error(err);
                Alert.alert("Error", "Failed to fetch user data");
            }
        };

        fetchUserData();
    }, []);

    const validatePhoneNumber = (phone) => {
        const pakistaniPattern = /^03[0-9]{9}$/;
        return pakistaniPattern.test(phone);
    };

    const handleSave = async () => {
        if (!form.username || form.username.trim() === "") {
            return Alert.alert("Invalid Username", "Username cannot be empty.");
        }

        if (!form.phone_number || !validatePhoneNumber(form.phone_number)) {
            return Alert.alert("Invalid Phone", "Please enter a valid Pakistani phone number starting with 03...");
        }

        try {
            await axios.put(`${CUSTOMER_API}/${userData.id}`, form);
            Alert.alert("Success", "Profile updated");
            setEditMode(false);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to update profile");
        }
    };

    if (!userData) return <Text className="text-center mt-10">Loading...</Text>;

    return (
        <ScrollView className="flex-1 bg-white p-6">
            <View className="mt-5 mb-5">
                <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Personal Info</Text>
            </View>

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
                value={userData.c_email}
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

            {/* Address */}
            <Text className="text-gray-700 mb-1 font-i28_regular">Address</Text>
            <CustomInput
                placeholder="Add your address - Street, City, etc."
                value={form.address}
                editable={editMode}
                containerStyles="mb-4"
                onChangeText={(text) => setForm({ ...form, address: text })}
                icon="home"
            />


            <CustomButton
                title={editMode ? "Save Changes" : "Edit Info"}
                onPress={editMode ? handleSave : () => setEditMode(true)}
                bgColor={editMode ? "#704F38" : "white"}
                titleColor={editMode ? "white" : "#704F38"}
                containerStyles={
                    editMode
                        ? "mt-4"
                        : "border-2 border-[#704F38]/60 mt-4" // brown border
                }
            />

        </ScrollView>
    );
};

export default PersonalInfo;
