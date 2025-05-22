import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { USERS_API } from "../../config/apiConfig";
import CustomButton from "../../components/ui/CustomButton";

const ResetPasswordScreen = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { email } = useLocalSearchParams();

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
    
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
    
        // ✅ Password validation: min 6 chars, includes both letters and numbers
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            Alert.alert(
                "Weak Password",
                "Password must be at least 6 characters long and include both letters and numbers."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${USERS_API}/update-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Password updated successfully.");
                router.push("/SignIn");
            } else {
                Alert.alert("Error", data.error || "Something went wrong.");
            }
        } catch (error) {
            console.error("Password Reset Error:", error);
            Alert.alert("Error", "Failed to connect to the server.");
        }

        setLoading(false);
    };

    return (
        <SafeAreaView className="bg-white h-full justify-center px-6">
            <Text className="text-2xl text-lightblack font-semibold text-center mb-4">
                Reset Password
            </Text>

            <TextInput
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                className="border border-gray-300 rounded-lg p-4 mb-4 text-base"
            />

            <TextInput
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="border border-gray-300 rounded-lg p-4 mb-4 text-base"
            />

            <CustomButton
                title={loading ? "Updating..." : "Update Password"}
                onPress={handleResetPassword}
                disabled={loading}
                containerStyles="mt-4"
            />
        </SafeAreaView>
    );
};

export default ResetPasswordScreen;
