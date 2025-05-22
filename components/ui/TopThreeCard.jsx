// components/ui/TopThreeCard.jsx
import React from "react";
import { View, Text } from "react-native";

const TopThreeCard = ({ rank, username, points, isCurrentUser }) => {
  // Sizes per rank
  const size = rank === 1 ? 80 : rank === 2 ? 75 : 70;
  const bgColor = isCurrentUser ? "bg-gray-300" : "bg-gray-200";
  const borderStyle = isCurrentUser ? "border-2 border-brown" : "";

  // Medal emoji per rank
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";

  return (
    <View className={`items-center mx-2 rounded-full`}>
      <View
        className={`rounded-full justify-center items-center ${bgColor} ${borderStyle}`}
        style={{ width: size, height: size }}
      >
        <Text
          className={`text-xl font-i24_semibold text-brown`}
        >
         {rank} {medal} 
        </Text>
      </View>
      <Text
        className="text-[17px] text-center mt-1 font-i28_regular text-brown"
        numberOfLines={1}
      >
        {username}
      </Text>
      <Text className="text-sm text-gray-600 font-i28_regular">{points} pts</Text>
    </View>
  );
};

export default TopThreeCard;
