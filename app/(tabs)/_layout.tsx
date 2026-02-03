import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants';

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        height: 56 + insets.bottom,
                        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    }
                ],
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textTertiary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: '홈',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="diary"
                options={{
                    title: '감사일기',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? 'book' : 'book-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="archive"
                options={{
                    title: '보관함',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? 'file-tray-full' : 'file-tray-full-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: '설정',
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? 'settings' : 'settings-outline'}
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        elevation: 0,
        shadowOpacity: 0,
        paddingTop: 6,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
});
