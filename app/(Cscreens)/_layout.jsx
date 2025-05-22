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

      </Stack>

      <StatusBar style="light" />
    </>
  )
}

export default CscreensLayout