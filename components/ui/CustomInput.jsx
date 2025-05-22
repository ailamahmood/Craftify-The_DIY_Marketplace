import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CustomInput = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  containerStyles,
  icon = null,
  editable = true, // <-- Add this line
}) => {
  return (
    <View className={`flex-row items-center border border-gray-300 w-full rounded-lg p-1 pl-3 mb-3 ${containerStyles}`}>
      {icon && <Ionicons name={icon} size={20} color="gray" style={{ marginRight: 10 }} />}  
      <TextInput
        className="flex-1 text-base bg-transparent"
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        editable={editable} // <-- Add this line
      />
    </View>
  );
};

export default CustomInput;
