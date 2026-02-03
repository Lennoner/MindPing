import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors, FontSize } from '../src/constants';
import { useUserStore } from '../src/stores/userStore';

export default function SplashScreen() {
    const router = useRouter();
    const { isOnboarded } = useUserStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // 1초 뒤에 준비 상태로 변경
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isReady) return;

        // 준비되면 온보딩 상태에 따라 이동
        const navigationTimer = setTimeout(() => {
            if (isOnboarded) {
                router.replace('/(tabs)');
            } else {
                router.replace('/onboarding');
            }
        }, 1000);

        return () => clearTimeout(navigationTimer);
    }, [isReady, router, isOnboarded]);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.emoji}>💜</Text>
                <Text style={styles.title}>마음알림</Text>
                <Text style={styles.subtitle}>예측할 수 없는 순간, 예상치 못한 위로</Text>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginTop: 20 }} />
            </View>

            <Text style={styles.slogan}>MindPing</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    slogan: {
        position: 'absolute',
        bottom: 48,
        fontSize: FontSize.sm,
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 2,
    },
});
