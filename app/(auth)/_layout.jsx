import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'

const AuthLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="SignIn"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="SignUp"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="VerifyCodeScreen"
          options={{
            headerShown: false
          }}
        />
      </Stack>

      <StatusBar style="light" />
    </>
  )
}

export default AuthLayout