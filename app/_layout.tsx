import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors } from '../src/constants';
import { registerForPushNotificationsAsync } from '../src/utils/notifications';

// 라이트 테마
const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: LightColors.primary,
        secondary: LightColors.primaryLight,
        background: LightColors.background,
        surface: LightColors.surface,
        error: LightColors.error,
    },
};

// 다크 테마
const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: DarkColors.primary,
        secondary: DarkColors.primaryLight,
        background: DarkColors.background,
        surface: DarkColors.surface,
        error: DarkColors.error,
    },
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const theme = isDarkMode ? darkTheme : lightTheme;

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
                    <StatusBar style={isDarkMode ? 'light' : 'dark'} />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen name="index" />
                        <Stack.Screen name="onboarding" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="notification-settings" options={{ presentation: 'modal' }} />
                    </Stack>
                </PaperProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
