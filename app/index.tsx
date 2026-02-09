import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/stores/userStore';

export default function SplashScreen() {
    const router = useRouter();
    const { isOnboarded } = useUserStore();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    // 애니메이션 값들
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // 페이드 인 + 스케일 애니메이션
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // 1.2초 후 다음 화면으로 이동
        const timer = setTimeout(() => {
            // 페이드 아웃
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                if (isOnboarded) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/onboarding');
                }
            });
        }, 1200);

        return () => clearTimeout(timer);
    }, [isOnboarded]);

    const backgroundColor = isDarkMode ? '#1A1A2E' : '#FFFFFF';
    const textColor = isDarkMode ? '#FFFFFF' : '#1A1A2E';
    const accentColor = '#6366F1';

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    }
                ]}
            >
                {/* 메인 타이틀 */}
                <Text style={[styles.title, { color: textColor }]}>
                    마음알림
                </Text>

                {/* 심플한 언더라인 악센트 */}
                <View style={[styles.accent, { backgroundColor: accentColor }]} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '300',
        letterSpacing: 8,
    },
    accent: {
        width: 40,
        height: 3,
        borderRadius: 2,
        marginTop: 16,
    },
});
