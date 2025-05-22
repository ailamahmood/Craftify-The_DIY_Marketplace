import React from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";

const CustomDropdown = ({ selectedValue, onValueChange, items, containerStyles }) => {
    return (
        <View className={`border border-gray-300 rounded-lg mb-3 ${containerStyles}`}>
            <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
                {items.map((item, index) => (
                    <Picker.Item key={index} label={item.label} value={item.value} />
                ))}
            </Picker>
        </View>
    );
};

export default CustomDropdown;
