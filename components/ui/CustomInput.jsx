import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  containerStyles,
  icon = null,
  editable = true,
  error = false,
  multiline = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const showEyeIcon = secureTextEntry;

  return (
    <View className={`flex-row items-start border border-gray-300 w-full rounded-lg p-1 pl-3 mb-3 ${containerStyles}`}>
      {icon && <Ionicons name={icon} size={20} color="gray" style={{ marginRight: 10, marginTop: 12 }} />}

      <TextInput
        className="flex-1 text-base bg-transparent font-i24_regular"
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={showEyeIcon && !isPasswordVisible}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        blurOnSubmit={!multiline}
        returnKeyType={multiline ? "default" : "done"}
        textAlignVertical={multiline ? "top" : "center"}
      />

      {/* Eye icon for password toggle */}
      {showEyeIcon && (
        <Pressable onPress={() => setIsPasswordVisible((prev) => !prev)} style={{ padding: 8, marginTop: 4 }}>
          <Ionicons
            name={isPasswordVisible ? "eye" : "eye-off"}
            size={22}
            color="gray"
          />
        </Pressable>
      )}
    </View>
  );
};

export default CustomInput;
