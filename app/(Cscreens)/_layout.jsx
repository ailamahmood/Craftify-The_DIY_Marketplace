import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'

const CscreensLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="ProductDetail"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="CheckoutScreen"
          options={{
            headerShown: false
          }}
        />






        <Stack.Screen
          name="PersonalInfo"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="LeaderboardScreen"
          options={{
            headerShown: false
          }}
        />

<Stack.Screen
          name="MemoryBook"
          options={{
            headerShown: false
          }}
        />

<Stack.Screen
          name="Memory"
          options={{
            headerShown: false
          }}
        />

<Stack.Screen
          name="MyOrders"
          options={{
            headerShown: false
          }}
        />

<Stack.Screen
          name="OrderDetails"
          options={{
            headerShown: false
          }}
        />

<Stack.Screen
          name="Review"
          options={{
            headerShown: false
          }}
        />

<Stack.Screen
          name="StorePage"
          options={{
            headerShown: false
          }}
        />

      </Stack>

      <StatusBar style="light" />
    </>
  )
}

export default CscreensLayout