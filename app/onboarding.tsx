import { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/stores';
import { Colors, FontSize, Spacing, BorderRadius, ONBOARDING_SLIDES } from '../src/constants';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const { setOnboarded, setUser } = useUserStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showNicknameInput, setShowNicknameInput] = useState(false);
    const [nickname, setNickname] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = () => {
        if (currentIndex < ONBOARDING_SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            // 마지막 슬라이드 후 닉네임 입력 화면 표시
            setShowNicknameInput(true);
        }
    };

    const handleStart = () => {
        // 닉네임 저장 (입력하지 않으면 기본값)
        const finalNickname = nickname.trim() || '사용자';
        setUser({ nickname: finalNickname, createdAt: new Date() });
        setOnboarded(true);
        router.replace('/(tabs)');
    };

    const handleSkip = () => {
        setUser({ nickname: '사용자', createdAt: new Date() });
        setOnboarded(true);
        router.replace('/(tabs)');
    };

    const renderSlide = ({ item, index }: { item: typeof ONBOARDING_SLIDES[0]; index: number }) => (
        <View style={styles.slide}>
            <View style={styles.illustrationContainer}>
                <Text style={styles.illustrationEmoji}>
                    {index === 0 ? '🎲' : index === 1 ? '💤' : '🎁'}
                </Text>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
        </View>
    );

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {ONBOARDING_SLIDES.map((_, index) => {
                const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 24, 8],
                    extrapolate: 'clamp',
                });
                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={index}
                        style={[styles.dot, { width: dotWidth, opacity }]}
                    />
                );
            })}
        </View>
    );

    // 닉네임 입력 화면
    if (showNicknameInput) {
        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.nicknameContainer}>
                    <View style={styles.nicknameHeader}>
                        <Text style={styles.nicknameEmoji}>👋</Text>
                        <Text style={styles.nicknameTitle}>반가워요!</Text>
                        <Text style={styles.nicknameSubtitle}>
                            뭐라고 불러드릴까요?
                        </Text>
                    </View>

                    <TextInput
                        style={styles.nicknameInput}
                        placeholder="닉네임을 입력해주세요"
                        placeholderTextColor={Colors.textTertiary}
                        value={nickname}
                        onChangeText={setNickname}
                        maxLength={10}
                        autoFocus
                    />
                    <Text style={styles.nicknameHint}>
                        {nickname.length}/10 (나중에 변경할 수 있어요)
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            onPress={handleStart}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                        >
                            시작하기
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.skipContainer}>
                <Button
                    mode="text"
                    onPress={handleSkip}
                    textColor={Colors.textSecondary}
                >
                    건너뛰기
                </Button>
            </View>

            <FlatList
                ref={flatListRef}
                data={ONBOARDING_SLIDES}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            />

            {renderDots()}

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={handleNext}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                >
                    {currentIndex === ONBOARDING_SLIDES.length - 1 ? '다음' : '다음'}
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    skipContainer: {
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    illustrationContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(129, 140, 248, 0.15)', // primaryLight의 rgba
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    illustrationEmoji: {
        fontSize: 80,
    },
    slideTitle: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    slideDescription: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginHorizontal: 4,
    },
    buttonContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    button: {
        borderRadius: 12,
    },
    buttonContent: {
        height: 56,
    },
    buttonLabel: {
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
    // 닉네임 입력 화면 스타일
    nicknameContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    nicknameHeader: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    nicknameEmoji: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    nicknameTitle: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    nicknameSubtitle: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    nicknameInput: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: FontSize.lg,
        color: Colors.text,
        textAlign: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    nicknameHint: {
        fontSize: FontSize.sm,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginTop: Spacing.sm,
        marginBottom: Spacing.xl,
    },
});
