import { Stack } from 'expo-router'
import React from 'react'

const StackLayout = () => {
    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: {
                backgroundColor: 'white'
            }
        }}>
            <Stack.Screen name='auth/index' />
            <Stack.Screen name='(tabs)' />
        </Stack>
    )
}

export default StackLayout