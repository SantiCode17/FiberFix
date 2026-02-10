import { UserProvider } from '@/context/UserContext';
import { Stack } from 'expo-router';
import React from 'react';

const StackLayout = () => {
    return (
        <UserProvider>
            <Stack screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: 'white'
                }
            }}>
                <Stack.Screen name='auth/index' />
                <Stack.Screen name='(tabs)' />
            </Stack>
        </UserProvider>
    )
}

export default StackLayout