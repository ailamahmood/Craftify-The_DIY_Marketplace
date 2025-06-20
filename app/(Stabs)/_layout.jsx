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
                }}
            >
                <Tabs.Screen
                    name="Products"
                    options={{
                        title: 'Products',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.store}
                                color={color}
                                name="Product"
                                focused={focused}
                            />
                        )
                    }}
                />

                <Tabs.Screen
                    name="Dashboard"
                    options={{
                        title: 'Dashboard',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.dashboard}
                                color={color}
                                name="Dashbord"
                                focused={focused}
                            />
                        )
                    }}
                />

                <Tabs.Screen
                    name="AddProduct"
                    options={{
                        title: 'AddProduct',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.add}
                                color={color}
                                name="Add"
                                focused={focused}
                            />
                        )
                    }}
                />

                <Tabs.Screen
                    name="Order"
                    options={{
                        title: 'Order',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.orders}
                                color={color}
                                name="Orders"
                                focused={focused}
                            /> 
                        )
                    }}
                />

                <Tabs.Screen
                    name="SAccount"
                    options={{
                        title: 'SAccount',
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