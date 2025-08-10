// components/FAQItem.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="border-b border-gray-300 py-6">
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text className="text-lg font-i28_semibold text-gray-800">{question}</Text>
      </TouchableOpacity>
      {expanded && (
        <Text className="mt-2 text-gray-600 font-i28_regular text-base leading-relaxed">{answer}</Text>
      )}
    </View>
  );
};

export default FAQItem;
