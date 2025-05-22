// components/AccountOption.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

const AccountOption = ({ icon, iconType = "FontAwesome", title, subtitle, onPress }) => {
  const Icon = iconType === "MaterialIcons" ? MaterialIcons : FontAwesome;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-6 py-4 border-b border-gray-200"
    >
      <Icon name={icon} size={24} className="text-black mr-5" />
      <View>
        <Text className="text-base ">{title}</Text>
        <Text className="text-sm text-gray-500 font-i28_regular">{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default AccountOption;
