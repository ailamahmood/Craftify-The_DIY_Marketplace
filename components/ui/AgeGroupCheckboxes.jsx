import React from 'react';
import { View, Text } from 'react-native';
import Checkbox from 'expo-checkbox';

const AGE_OPTIONS = ['kids', 'teens', 'adults', 'all'];

export default function AgeGroupCheckboxes({ selected, onChange }) {
  const toggle = (age) => {
    const updated = selected.includes(age)
      ? selected.filter((a) => a !== age)
      : [...selected, age];
    onChange(updated);
  };

  return (
    <View className="flex-row flex-wrap gap-4">
      {AGE_OPTIONS.map((age) => (
        <View key={age} className="flex-row items-center gap-2">
          <Checkbox
  value={selected.includes(age)}
  onValueChange={() => toggle(age)}
  color={selected.includes(age) ? '#704F38' : undefined}
/>

          <Text className="text-base capitalize text-gray-700">{age}</Text>
        </View>
      ))}
    </View>
  );
}
