import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OTP_API, USERS_API } from "../../config/apiConfig"; // Import API URL
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";
import CustomDropdown from "../../components/ui/CustomDropdown"; // Import CustomDropdown

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Customer");
    const [signInLoading, setSignInLoading] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const router = useRouter();  // Expo Router navigation

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Email and password are required!");
            return;
        }

        setSignInLoading(true);

        try {
            const response = await fetch(`${USERS_API}/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Signed in successfully!");

                // Store user details in AsyncStorage
                await AsyncStorage.setItem("user", JSON.stringify(data.user));

                // Navigate based on role
                if (role.toLowerCase() === "customer") {
                    router.replace("/Home"); // Customer Home tab
                } else if (role.toLowerCase() === "seller") {
                    router.replace("/Store"); // Seller Store tab
                }

            } else {
                Alert.alert("Error", data.error || "Invalid credentials.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to connect to the server.");
            console.error("Sign In Error:", error);
        }

        setSignInLoading(false);
    };

    const handleForgotPassword = async () => {
        if (!email) {
          Alert.alert("Error", "Please enter your email to reset password.");
          return;
        }
      
        setForgotLoading(true);
      
        try {
          const response = await fetch(`${OTP_API}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
      
          const data = await response.json();
      
          if (response.ok) {
            Alert.alert("OTP Sent", "A reset code has been sent to your email.");
            router.push({
              pathname: "/VerifyCodeScreen",
              params: { email, mode: "reset" },
            });
          } else {
            Alert.alert("Error", data.error || "Failed to send OTP.");
          }
        } catch (error) {
          console.error("Forgot Password Error:", error);
          Alert.alert("Error", "Something went wrong.");
        } finally {
            setForgotLoading(false);
        }
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
                        Sign In to your Account
                    </Text>
                    <Text className="text-gray-500 text-center mb-16">
                        Hi, Welcome back, you’ve been missed
                    </Text>

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
                        containerStyles="border-2 border-brown/60 text-brown mt-10"
                        bgColor="white"
                        titleColor="#704F38"
                        onPress={handleForgotPassword}
                        disabled={forgotLoading || !email}
                        title={forgotLoading ? "Sending OTP..." : "Forgot Password"}
                    />


                    <CustomButton
                        containerStyles="mt-4"  // Add any additional styles you need (e.g., margin-top)
                        onPress={handleSignIn}
                        disabled={signInLoading}
                        title={signInLoading ? "Signing In..." : "Sign In"}
                    />

                    <Text className="text-center text-gray-500 mt-6">
                        Don't have an account?{"  "}
                        <Link href="/SignUp" className="text-brown text-base font-semibold">Sign Up</Link>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignIn;
