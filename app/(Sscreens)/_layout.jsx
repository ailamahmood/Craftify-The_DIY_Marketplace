import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'

const SscreensLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="Store"
          options={{
            headerShown: false
          }}
        />

<Stack.Screen
          name="EditProduct"
          options={{
            headerShown: false
          }}
        />

      </Stack>

      <StatusBar style="light" />
    </>
  )
}

export default SscreensLayout