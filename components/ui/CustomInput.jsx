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
  editable = true, 
  error = false,
  multiline = false, // ✅ Add multiline prop
}) => {
  return (
    <View className={`flex-row items-start border border-gray-300 w-full rounded-lg p-1 pl-3 mb-3 ${containerStyles}`}>
      {icon && <Ionicons name={icon} size={20} color="gray" style={{ marginRight: 10, marginTop: 12 }} />}  
      <TextInput
        className="flex-1 text-base bg-transparent font-i24_regular"
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline} // ✅ Set multiline
        blurOnSubmit={!multiline} // ✅ Prevent closing keyboard if multiline
        returnKeyType={multiline ? "default" : "done"} // ✅ Correct keyboard button
        textAlignVertical={multiline ? "top" : "center"} // ✅ Better alignment for multiline
      />
    </View>
  );
};

export default CustomInput;
