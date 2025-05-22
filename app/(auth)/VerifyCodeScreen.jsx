import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OTP_API, USERS_API } from "../../config/apiConfig";
import CustomButton from "../../components/ui/CustomButton";

const VerifyCodeScreen = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { email, username, password, role, mode } = useLocalSearchParams();

    console.log("Params received in VerifyCodeScreen:", {
        email,
        username,
        password,
        role,
        mode
    });

    const handleVerifyOTP = async () => {
        if (!otp) {
            Alert.alert("Error", "Please enter the OTP!");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${OTP_API}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "OTP verified!");

                if (mode === "signup") {
                    console.log("Registering user after OTP:", { username, email, password, role, otp });

                    const signUpResponse = await fetch(`${USERS_API}/signup`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username, email, password, role, otp }), // Include OTP if needed by backend
                    });

                    const signUpData = await signUpResponse.json();

                    if (signUpResponse.ok) {
                        Alert.alert("Success", "Account created successfully!");
                        router.push("/SignIn");
                    } else {
                        Alert.alert("Error", signUpData.error || "Something went wrong.");
                    }

                } else if (mode === "reset") {
                    router.push({
                        pathname: "/ResetPasswordScreen",
                        params: { email },
                    });
                }

            } else {
                Alert.alert("Error", data.error || "Invalid OTP! Please try again.");
            }

        } catch (error) {
            console.error("Verify OTP Error:", error);
            Alert.alert("Error", "Failed to connect to the server.");
        }

        setLoading(false);
    };

    return (
        <SafeAreaView className="bg-white h-full flex justify-center px-6">
            <Text className="text-2xl text-lightblack font-semibold text-center mb-4">
                Enter OTP
            </Text>
            <Text className="text-gray-500 text-center mb-8">
                A 6-digit verification code was sent to {email}
                {"\n\n"}(If not received check the spam folder)
            </Text>

            <TextInput
                className="border border-gray-300 rounded-lg p-4 text-base text-center mb-3"
                placeholder="Enter OTP"
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
            />

            <CustomButton
                containerStyles="mt-8"
                onPress={handleVerifyOTP}
                disabled={loading}
                title={
                    loading
                        ? "Verifying..."
                        : mode === "reset"
                            ? "Verify & Continue"
                            : "Verify & Register"
                }
            />
        </SafeAreaView>
    );
};

export default VerifyCodeScreen;
