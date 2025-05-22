// components/CategoryCard.jsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);

const CategoryCard = ({ image, name, onPress }) => {
    return (
        <StyledTouchableOpacity
            className="flex-row items-center p-4 bg-white rounded-xl mb-3 shadow-sm"
            onPress={onPress}
        >
            <StyledImage
                source={{ uri: image }}
                className="w-16 h-16 rounded-md mr-8"
                resizeMode="cover"
            />
            <StyledText className="text-base text-[17px] font-i18_bold text-brown">
                {name}
            </StyledText>
        </StyledTouchableOpacity>
    );
};

export default CategoryCard;
