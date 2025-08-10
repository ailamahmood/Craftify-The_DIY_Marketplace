// components/ui/StarRating.js

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const StarRating = ({ rating, onRatingChange }) => {
  const handlePress = (index) => {
    const newRating = rating === index + 1 ? index + 0.5 : index + 1;
    onRatingChange(newRating);
  };

  const renderStar = (index) => {
    const full = index + 1 <= rating;
    const half = rating > index && rating < index + 1;
    return (
      <TouchableOpacity className='mb-5 ml-2' key={index} onPress={() => handlePress(index)}>
        <FontAwesome
          name={full ? 'star' : half ? 'star-half-full' : 'star-o'}
          size={32}
          color="#FFD700"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
      {[0, 1, 2, 3, 4].map(renderStar)}
    </View>
  );
};

export default StarRating;

