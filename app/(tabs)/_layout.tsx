import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants';

// 간단한 아이콘 컴포넌트 (텍스트 기반)
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, string> = {
        home: '🏠',
        archive: '📬',
        settings: '⚙️',
    };

    return (
        <View style={[styles.iconContainer, focused && styles.iconFocused]}>
            <View style={styles.icon}>
                <View style={{ opacity: focused ? 1 : 0.5 }}>
                    {name === 'home' && <HomeIcon focused={focused} />}
                    {name === 'archive' && <ArchiveIcon focused={focused} />}
                    {name === 'settings' && <SettingsIcon focused={focused} />}
                </View>
            </View>
            {focused && <View style={styles.dot} />}
        </View>
    );
}

// SVG 대신 간단한 View 기반 아이콘
function HomeIcon({ focused }: { focused: boolean }) {
    return (
        <View style={[styles.simpleIcon, { borderWidth: 2, borderColor: focused ? Colors.primary : Colors.textSecondary, borderRadius: 4 }]}>
            <View style={{ width: 8, height: 6, borderTopWidth: 2, borderColor: focused ? Colors.primary : Colors.textSecondary, marginTop: -8 }} />
        </View>
    );
}

function ArchiveIcon({ focused }: { focused: boolean }) {
    return (
        <View style={[styles.simpleIcon, { borderWidth: 2, borderColor: focused ? Colors.primary : Colors.textSecondary, borderRadius: 4 }]} />
    );
}

function SettingsIcon({ focused }: { focused: boolean }) {
    return (
        <View style={[styles.simpleIcon, { borderWidth: 2, borderColor: focused ? Colors.primary : Colors.textSecondary, borderRadius: 12 }]} />
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="archive"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="archive" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.white,
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        height: 80,
        paddingTop: 12,
        paddingBottom: 20,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconFocused: {},
    icon: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    simpleIcon: {
        width: 24,
        height: 24,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
        marginTop: 4,
    },
});
