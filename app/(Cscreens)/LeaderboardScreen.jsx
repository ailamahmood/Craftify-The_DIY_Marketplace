import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LEADERBOARD_API } from "../../config/apiConfig";
import TopThreeCard from "../../components/ui/TopThreeCard";
import LeaderboardRow from "../../components/ui/LeaderboardRow";

const LeaderboardScreen = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [month, setMonth] = useState("");
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndLeaderboard = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                const parsedUser = storedUser ? JSON.parse(storedUser) : null;
                if (parsedUser) {
                    setUserId(parsedUser.id);
                }

                const res = await fetch(`${LEADERBOARD_API}/current`);
                const data = await res.json();
                setLeaderboard(data.leaderboard);
                setMonth(data.month);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndLeaderboard();
    }, []);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#704F38" />
            </SafeAreaView>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <SafeAreaView className="bg-white h-full px-6">
            <ScrollView>
                <View className="mt-5 mb-2">
                    <Text className="text-lightblack mt-1 text-[28px] font-i28_semibold text-center">Leaderboard</Text>
                </View>
                <Text className="text-lg text-gray-600 font-semibold text-center mb-2">
                    {month}
                </Text>

                {/* Top 3 Circle Cards */}
                <View className="flex-row justify-around items-end mb-6 mt-4">
                    {topThree.map((item, index) => (
                        <TopThreeCard
                            key={item.id}
                            rank={index + 1}
                            username={item.username}
                            points={item.points}
                            isCurrentUser={item.id === userId}
                        />
                    ))}
                </View>

                {/* Other Rankings */}
                <View>
                    {others.map((item, index) => (
                        <LeaderboardRow
                            key={item.id}
                            rank={index + 4}
                            username={item.username}
                            points={item.points}
                            isCurrentUser={item.id === userId}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default LeaderboardScreen;
