import { Tabs } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '../../src/constants';

// 간단한 아이콘 컴포넌트 (이모지 기반)
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, string> = {
        home: '🏠',
        diary: '🙏',
        archive: '📬',
        settings: '⚙️',
    };

    return (
        <View style={[styles.iconContainer, focused && styles.iconFocused]}>
            <View style={styles.icon}>
                <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
                    {icons[name]}
                </Text>
            </View>
            {focused && <View style={styles.dot} />}
        </View>
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
                name="diary"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="diary" focused={focused} />,
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
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
        marginTop: 4,
    },
});
