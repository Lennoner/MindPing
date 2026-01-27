import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants';

export default function LoginScreen() {
    const router = useRouter();

    const handleKakaoLogin = () => {
        // TODO: 카카오 로그인 구현
        router.push('/(auth)/profile-setup');
    };

    const handleNaverLogin = () => {
        // TODO: 네이버 로그인 구현
        router.push('/(auth)/profile-setup');
    };

    const handleAppleLogin = () => {
        // TODO: Apple 로그인 구현
        router.push('/(auth)/profile-setup');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.emoji}>💜</Text>
                <Text style={styles.title}>마음알림</Text>
                <Text style={styles.subtitle}>간편하게 로그인하고{'\n'}마음 케어를 시작하세요</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.socialButton, styles.kakaoButton]}
                    onPress={handleKakaoLogin}
                    activeOpacity={0.8}
                >
                    <Text style={styles.kakaoButtonText}>💬 카카오로 시작하기</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialButton, styles.naverButton]}
                    onPress={handleNaverLogin}
                    activeOpacity={0.8}
                >
                    <Text style={styles.naverButtonText}>N 네이버로 시작하기</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={handleAppleLogin}
                    activeOpacity={0.8}
                >
                    <Text style={styles.appleButtonText}> Apple로 시작하기</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.terms}>
                로그인 시 <Text style={styles.link}>이용약관</Text> 및{' '}
                <Text style={styles.link}>개인정보처리방침</Text>에 동의하게 됩니다.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    emoji: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    socialButton: {
        height: 56,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    kakaoButton: {
        backgroundColor: '#FEE500',
    },
    kakaoButtonText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: '#191919',
    },
    naverButton: {
        backgroundColor: '#03C75A',
    },
    naverButtonText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    appleButton: {
        backgroundColor: '#000000',
    },
    appleButtonText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    terms: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        textAlign: 'center',
        lineHeight: 18,
    },
    link: {
        color: Colors.primary,
        textDecorationLine: 'underline',
    },
});
