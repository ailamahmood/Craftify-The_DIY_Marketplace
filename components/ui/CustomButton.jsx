import React from "react";
import { TouchableOpacity, Text,ActivityIndicator } from "react-native";

const CustomButton = ({ title, onPress, isLoading = false, bgColor = "#704F38", titleColor = "#FFF", containerStyles}) => {
    return (
        <TouchableOpacity
            onPress={isLoading ? null : onPress}
            className={`w-full py-4 rounded-2xl items-center justify-center ${containerStyles}`} 
            style={{ backgroundColor: bgColor }}
            activeOpacity={0.7}
        >
            {isLoading ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text className="text-lg font-i28_semibold" style={{ color: titleColor }}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

export default CustomButton;
