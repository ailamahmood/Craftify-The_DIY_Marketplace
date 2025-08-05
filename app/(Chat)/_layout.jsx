import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'

const ChatLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="ChatList"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="ChatScreen"
          options={{
            headerShown: false
          }}
        />

      </Stack>

      <StatusBar style="light" />
    </>
  )
}

export default ChatLayout