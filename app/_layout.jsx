import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SplashScreen, Stack } from 'expo-router'    //Slot component is used to render child routes inside a parent layout dynamically. It acts like a placeholder for nested routes
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { CartProvider } from "../context/CartContext";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),

    "inknutantiqua_bold": require("../assets/fonts/inknutantiqua_bold.ttf"),

    "inter_18pt_bold": require("../assets/fonts/inter_18pt_bold.ttf"),
    "inter_18pt_extrabold": require("../assets/fonts/inter_18pt_extrabold.ttf"),
    "inter_18pt_medium": require("../assets/fonts/inter_18pt_medium.ttf"),
    "inter_18pt_regular": require("../assets/fonts/inter_18pt_regular.ttf"),
    "inter_18pt_semibold": require("../assets/fonts/inter_18pt_semibold.ttf"),
    "inter_24pt_bold": require("../assets/fonts/inter_24pt_bold.ttf"),
    "inter_24pt_extrabold": require("../assets/fonts/inter_24pt_extrabold.ttf"),
    "inter_24pt_medium": require("../assets/fonts/inter_24pt_medium.ttf"),
    "inter_24pt_regular": require("../assets/fonts/inter_24pt_regular.ttf"),
    "inter_24pt_semibold": require("../assets/fonts/inter_24pt_semibold.ttf"),
    "inter_28pt_bold": require("../assets/fonts/inter_28pt_bold.ttf"),
    "inter_28pt_extrabold": require("../assets/fonts/inter_28pt_extrabold.ttf"),
    "inter_28pt_italic": require("../assets/fonts/inter_28pt_italic.ttf"),
    "inter_28pt_light": require("../assets/fonts/inter_28pt_light.ttf"),
    "inter_28pt_medium": require("../assets/fonts/inter_28pt_medium.ttf"),
    "inter_28pt_regular": require("../assets/fonts/inter_28pt_regular.ttf"),
    "inter_28pt_semibold": require("../assets/fonts/inter_28pt_semibold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error])

  if (!fontsLoaded && !error) return null;

  return (
    <CartProvider>   
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(Ctabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(Cscreens)" options={{ headerShown: false }} />
        <Stack.Screen name="(Stabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(Sscreens)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </CartProvider>
  )
}

export default RootLayout

/*The root layout (app/_layout.tsx) in Expo Router defines the global structure of your app. It:
    Wraps all screens in a common layout.
    Uses <Slot /> to render child routes dynamically.
    Persists UI elements like headers, footers, or navigation bars across screens.*/

