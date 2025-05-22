import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from "expo-router";
import icons from "../../constants/icons";
import { StatusBar } from 'expo-status-bar'

const TabIcon = ({ icon, color, name, focused }) => {
    return (
        <View className="items-center justify-center gap-2">
            <View
                className={`w-10 h-10 rounded-full ${focused ? 'bg-black' : 'bg-transparent'} items-center justify-center`}
            >
                <Image
                    source={icon}
                    resizeMode="contain"
                    tintColor={focused ? '#FFFFFF' : color} // White icon if active
                    className="w-6 h-6"
                />
            </View>
            <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs text-center w-16`} style={{ color: color }}>
                {name}
            </Text>
        </View>
    );
};


const TabsLayout = () => {
    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: "#000000",
                    tabBarInactiveTintColor: "#000000",
                    tabBarStyle: {
                        height: 80,         // Increase tab bar height
                        paddingBottom: 15,  // Push content down           
                        paddingTop: 20,     // Balance spacing

                        backgroundColor: '#FFFFFF',
                        borderTopWidth: 0,
                        borderTopColor: '#000000',
                    },
                    headerShown: false,

                }}
            >
                <Tabs.Screen
                    name="Home"
                    options={{
                        title: 'Home',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.home}
                                color={color}
                                name="Home"
                                focused={focused}
                            />
                        )
                    }}
                />
                <Tabs.Screen
                    name="Category"
                    options={{
                        title: 'Category',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.category}
                                color={color}
                                name="Category"
                                focused={focused}
                            />
                        )
                    }}
                />
                <Tabs.Screen
                    name="Wishlist"
                    options={{
                        title: 'Wishlist',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.heart}
                                color={color}
                                name="Wishlist"
                                focused={focused}
                            />
                        )
                    }}
                />
                <Tabs.Screen
                    name="Cart"
                    options={{
                        title: 'Cart',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.cart}
                                color={color}
                                name="Cart"
                                focused={focused}
                            />
                        )
                    }}
                />
                <Tabs.Screen
                    name="Account"
                    options={{
                        title: 'Account',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.user}
                                color={color}
                                name="Account"
                                focused={focused}
                            />
                        )
                    }}
                />
            </Tabs>

            <StatusBar backgroundColor='#161622' style="light" />
        </>
    )
}

export default TabsLayout