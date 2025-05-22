// components/ui/LeaderboardRow.jsx
import React from "react";
import { View, Text } from "react-native";

const LeaderboardRow = ({ rank, username, points, isCurrentUser }) => {
    const bgColor = isCurrentUser ? "bg-gray-300" : "bg-gray-100";
  const borderStyle = isCurrentUser ? "border-2 border-brown" : "";

  return (
    <View
      className={`flex-row justify-between items-center p-5 mb-3 rounded-3xl ${bgColor} ${borderStyle}`}
    >
      <Text className="text-lg text-lightblack font-i28_semibold">{rank}</Text>
      <Text className="flex-1 text-brown ml-6 text-base font-i28_regular" numberOfLines={1}>
        {username}
      </Text>
      <Text className="text-base text-gray-600 font-i28_semibold">{points} pts</Text>
    </View>
  );
};

export default LeaderboardRow;
