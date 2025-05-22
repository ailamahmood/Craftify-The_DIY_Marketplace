import { StatusBar } from "expo-status-bar";
import React, { useState, useRef, useEffect } from "react";
import { View, Text, ImageBackground, FlatList, Dimensions, Platform, StatusBar as RNStatusBar } from "react-native";
import { useRouter } from "expo-router";
import CustomButton from "../components/ui/CustomButton"; // Import the reusable button

// Get screen dimensions
const { width, height } = Dimensions.get("window");
// Handle status bar height for Android
const STATUSBAR_HEIGHT = Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0;

// Define slides for onboarding
const slides = [
  {
    id: "1",
    title: "Unleash Your Creativity!",
    description: "Discover craft kits, ideas, and fun projects to spark your imagination.",
    image: require("../assets/images/slide1.png"),
  },
  {
    id: "2",
    title: "Create, Share, and Enjoy!",
    description: "Join a community of creators and start crafting your next masterpiece today.",
    image: require("../assets/images/slide2.png"),
  },
  {
    id: "3",
    image: require("../assets/images/slide3.png"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide index
  const flatListRef = useRef(null); // Reference to FlatList for navigation

  // Auto-slide effect every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        let nextIndex = prevIndex + 1;
        if (nextIndex >= slides.length) nextIndex = 0; // Loop back to the first slide
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 5000); // Change slides every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Function to render each slide item
  const renderItem = ({ item }) => (
    <View className="w-screen" style={{ height: height + STATUSBAR_HEIGHT }}>
      <ImageBackground source={item.image} className="w-full h-full" resizeMode="cover">
        <View className="flex-1 justify-end items-center px-5 pb-16 bg-black/60">
          {item.title && <Text className="text-white text-[28px] font-bold text-center mb-2 font-[inter_24pt_bold]">{item.title}</Text>}
          {item.description && <Text className="text-white text-[16px] text-center mb-5 font-[inter_18pt_regular]">{item.description}</Text>}

          <CustomButton
            title={activeIndex === slides.length - 1 ? "Get Started" : "Next"}
            onPress={() => router.push("/SignUp")}
            bgColor="black"
            containerStyles="border border-white/10 shadow-lg shadow-white/50"
          />
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Horizontal slide carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ height }}
        onMomentumScrollEnd={(event) => {
          // Update active index on manual swipe
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      />

      {/* Pagination Dots */}
      <View className="absolute top-12 left-5 flex-row">
        {slides.map((_, index) => (
          <View key={index} className={`h-3 rounded-full mx-1 ${activeIndex === index ? "w-8 bg-black" : "w-3 bg-white"}`} />
        ))}
      </View>

      <StatusBar style="light" />
    </View>
  );
}
