import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as Notifications from 'expo-notifications';
import { LightColors, DarkColors } from '../src/constants';
import { registerForPushNotificationsAsync, syncNotificationToStore } from '../src/utils/notifications';

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
        // 알림 권한 요청
        registerForPushNotificationsAsync().then(granted => {
            if (granted) {

            }
        });


        // 알림 수신 리스너 (앱이 포그라운드에 있을 때)
        const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
            // 알림 수신 시 메시지를 스토어에 동기화 (앱 포그라운드)
            const data = notification.request.content.data as { messageId?: string };
            if (data?.messageId) {
                syncNotificationToStore(data.messageId);
            }
        });

        // 알림 클릭 리스너 (사용자가 알림을 탭했을 때)
        const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
            // 알림 탭 시 메시지를 스토어에 동기화
            const data = response.notification.request.content.data as { messageId?: string };
            if (data?.messageId) {
                syncNotificationToStore(data.messageId);
            }
        });


        // 클린업
        return () => {
            receivedSubscription.remove();
            responseSubscription.remove();
        };
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
