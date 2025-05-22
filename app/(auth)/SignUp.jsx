import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OTP_API, USERS_API } from "../../config/apiConfig"; // Import APIs
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";
import CustomDropdown from "../../components/ui/CustomDropdown"; // Import CustomDropdown

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Customer");
    const [loading, setLoading] = useState(false);

    const router = useRouter(); // Navigation

    const handleSendOTP = async () => {
        if (!username || !email || !password || !role) {
            Alert.alert("Error", "All fields are required!");
            return;
        }

        // ✅ Username validation: only alphabets (no numbers or special characters)
        const usernameRegex = /^[A-Za-z]+$/;
        if (!usernameRegex.test(username)) {
            Alert.alert("Invalid Username", "Username should only contain alphabets (no numbers or special characters).");
            return;
        }


        // ✅ Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address!");
            return;
        }

        // ✅ Password validation: min 6 chars, includes both letters and numbers
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(password)) {
            Alert.alert(
                "Weak Password",
                "Password must be at least 6 characters long and include both letters and numbers."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${OTP_API}/send-otp`, { // ✅ Send OTP API
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "OTP sent to your email!");
                // ✅ Navigate to OTP verification screen with user data
                router.push({
                    pathname: "/VerifyCodeScreen",
                    params: { email, username, password, role, mode: "signup" }
                });
            } else {
                Alert.alert("Error", data?.error || "Something went wrong. Please try again.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to connect to the server.");
            console.error("Send OTP Error:", error);
        }

        setLoading(false);
    };

    const roleItems = [
        { label: "Customer", value: "Customer" },
        { label: "Seller", value: "Seller" },
    ];

    return (
        <SafeAreaView className="bg-white h-full">
            <ScrollView contentContainerStyle={{ height: '100%' }}>
                <View className="flex-1 justify-center px-6 bg-white">
                    <Text className="text-2xl text-lightblack font-semibold text-center mb-2">
                        Create Your Account
                    </Text>
                    <Text className="text-gray-500 text-center mb-16">
                        Fill your information below or register with your social account
                    </Text>

                    <CustomInput
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <CustomInput
                        placeholder="Email"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <CustomInput
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    {/* Replace Picker with CustomDropdown */}
                    <CustomDropdown
                        selectedValue={role}
                        onValueChange={(itemValue) => setRole(itemValue)}
                        items={roleItems}
                        containerStyles="mb-3"
                    />

                    <CustomButton
                        containerStyles="mt-10"  // Add any additional styles you need (e.g., margin-top)
                        onPress={handleSendOTP}
                        disabled={loading}
                        title={loading ? "Sending OTP..." : "Sign Up"}
                    />

                    <Text className="text-center text-gray-500 mt-6">
                        Already have an account?{"  "}
                        <Link href="/SignIn" className="text-brown text-base font-semibold">Sign In</Link>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignUp;
