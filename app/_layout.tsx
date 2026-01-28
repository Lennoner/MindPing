import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Colors } from '../src/constants';
import { registerForPushNotificationsAsync } from '../src/utils/notifications';

// 커스텀 테마
const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: Colors.primary,
        secondary: Colors.primaryLight,
        background: Colors.background,
        surface: Colors.surface,
        error: Colors.error,
    },
};

export default function RootLayout() {
    useEffect(() => {
        registerForPushNotificationsAsync().then(granted => {
            if (granted) {
                console.log('Notification permissions granted');
            }
        });
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <PaperProvider theme={theme}>
                    <StatusBar style="dark" />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen name="index" />
                        <Stack.Screen name="onboarding" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="notification-settings" options={{ presentation: 'modal' }} />
                        <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
                    </Stack>
                </PaperProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
