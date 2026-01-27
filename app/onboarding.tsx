import { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/stores';
import { Colors, FontSize, Spacing, ONBOARDING_SLIDES } from '../src/constants';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const { setOnboarded } = useUserStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = () => {
        if (currentIndex < ONBOARDING_SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            handleStart();
        }
    };

    const handleStart = () => {
        setOnboarded(true);
        router.replace('/(auth)/login');
    };

    const handleSkip = () => {
        handleStart();
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
                    {currentIndex === ONBOARDING_SLIDES.length - 1 ? '시작하기' : '다음'}
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
});
