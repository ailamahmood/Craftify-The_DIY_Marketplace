import React from 'react';
import { View } from 'react-native';
import CustomButton from "../../components/ui/CustomButton";
import CustomInput from "../../components/ui/CustomInput";

export default function ProductOptionInput({ options, setOptions }) {
  const addOption = () => {
    setOptions([...options, { name: '', values: [''] }]);
  };

  const updateOptionName = (index, value) => {
    const updated = [...options];
    updated[index].name = value;
    setOptions(updated);
  };

  const updateOptionValue = (optIndex, valIndex, value) => {
    const updated = [...options];
    updated[optIndex].values[valIndex] = value;
    setOptions(updated);
  };

  const addOptionValue = (index) => {
    const updated = [...options];
    updated[index].values.push('');
    setOptions(updated);
  };

  return (
    <View className="space-y-4">
      {options.map((opt, optIdx) => (
        <View key={optIdx} className="space-y-2">
          <CustomInput
            placeholder="Option Name (e.g. Color)"
            value={opt.name}
            onChangeText={(text) => updateOptionName(optIdx, text)}
          />
          {opt.values.map((val, valIdx) => (
            <CustomInput
              key={valIdx}
              placeholder="Value (e.g. Red)"
              value={val}
              onChangeText={(text) => updateOptionValue(optIdx, valIdx, text)}
              containerStyles="ml-4"
            />
          ))}
          <CustomButton
            title="Add Value"
            onPress={() => addOptionValue(optIdx)}
            containerStyles="w-auto px-4 py-2 mb-2 rounded-md border-brown/60 border-2 "
            bgColor="white"
            titleColor="#704F38"
          />
        </View>
      ))}
      <CustomButton
        title="Add Option"
        onPress={addOption}
        containerStyles="w-full py-3 mt-3 rounded-2xl border-brown/80 border-2"
        titleColor="#704F38"
        bgColor="transparent"
      />
    </View>
  );
}
