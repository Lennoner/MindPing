import { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../src/stores';
import { Colors, FontSize, Spacing, BorderRadius, ONBOARDING_SLIDES } from '../src/constants';
import { registerForPushNotificationsAsync, scheduleRandomDailyMessage } from '../src/utils/notifications';

const { width } = Dimensions.get('window');

// 온보딩 슬라이드 + 닉네임 + 알림 권한 슬라이드
const SLIDES_WITH_EXTRAS = [
    ...ONBOARDING_SLIDES,
    {
        id: 4,
        title: '당신을 뭐라고 부를까요?',
        description: '마음알림이 당신을 따뜻하게\n불러드릴게요.',
        isNicknameSlide: true,
        icon: 'person-outline',
    },
    {
        id: 5,
        title: '알림을 허용해주세요',
        description: '예상치 못한 순간에 도착하는 위로 메시지가\n마음알림의 핵심이에요.\n알림을 켜야 메시지를 받을 수 있어요!',
        isNotificationSlide: true,
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { setOnboarded, setNotificationsEnabled, setUser } = useUserStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [notificationStatus, setNotificationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [nickname, setNickname] = useState('');
    const [showNicknameInput, setShowNicknameInput] = useState(false); // 추가된 상태
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const getSlideIcon = (slide: any) => {
        if (slide.icon) return slide.icon;
        if (slide.isNotificationSlide) return 'notifications-outline';
        return 'heart-outline';
    };

    const handleNext = async () => {
        const currentSlide = SLIDES_WITH_EXTRAS[currentIndex];

        // 닉네임 슬라이드
        if ((currentSlide as any).isNicknameSlide) {
            if (!nickname.trim()) {
                Alert.alert('알림', '닉네임을 입력해주세요.');
                return;
            }
            // 닉네임 저장
            setUser({
                nickname: nickname.trim(),
                createdAt: new Date(),
            });
        }

        // 알림 권한 슬라이드
        if ((currentSlide as any).isNotificationSlide && notificationStatus === 'pending') {
            const granted = await registerForPushNotificationsAsync();
            if (granted) {
                setNotificationStatus('granted');
                setNotificationsEnabled(true);
            } else {
                setNotificationStatus('denied');
                setNotificationsEnabled(false);
            }
            return;
        }

        if (currentIndex < SLIDES_WITH_EXTRAS.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            // 마지막 슬라이드 후 닉네임 입력 화면 표시 (기존 HEAD 로직: 여기서는 handleStart 호출 또는 추가 입력)
            // HEAD 로직 상 마지막은 알림권한이고, 그 다음은 없음. 그냥 handleStart 호출.
            handleStart();
        }
    };

    const handleStart = async () => {
        // 닉네임 저장 (입력하지 않으면 기본값)
        const finalNickname = nickname.trim() || '사용자';
        setUser({ nickname: finalNickname, createdAt: new Date() });
        setOnboarded(true);
        // 기본 시간대로 알림 자동 스케줄링 (리뷰어 로직 병합)
        await scheduleRandomDailyMessage(['forenoon', 'afternoon', 'evening']);
        router.replace('/(tabs)');
    };

    const handleSkip = () => {
        if (currentIndex === 0) {
            // 첫 화면에서의 건너뛰기는 바로 메인으로 이동 (기본값 설정)
            setNotificationsEnabled(false);
            handleStart();
            return;
        }

        const currentSlide = SLIDES_WITH_EXTRAS[currentIndex];
        if ((currentSlide as any).isNotificationSlide) {
            Alert.alert(
                '알림 설정을 건너뛸까요?',
                '알림 없이도 앱을 사용할 수 있지만,\n마음알림의 핵심 기능을 놓치게 됩니다.',
                [
                    { text: '취소', style: 'cancel' },
                    {
                        text: '건너뛰기',
                        onPress: () => {
                            setNotificationsEnabled(false);
                            handleStart();
                        }
                    }
                ]
            );
        } else {
            handleStart();
        }
    };

    const renderSlide = ({ item, index }: { item: any; index: number }) => {
        const isNotificationSlide = item.isNotificationSlide;
        const isNicknameSlide = item.isNicknameSlide;

        const iconName = isNotificationSlide && notificationStatus === 'granted'
            ? 'checkmark-circle-outline'
            : isNotificationSlide && notificationStatus === 'denied'
                ? 'alert-circle-outline'
                : getSlideIcon(item);

        const iconColor = isNotificationSlide && notificationStatus === 'granted'
            ? Colors.success
            : isNotificationSlide && notificationStatus === 'denied'
                ? Colors.warning
                : Colors.primary;

        return (
            <View style={styles.slide}>
                <View style={[
                    styles.illustrationContainer,
                    isNotificationSlide && notificationStatus === 'granted' && styles.illustrationSuccess,
                    isNotificationSlide && notificationStatus === 'denied' && styles.illustrationWarning,
                ]}>
                    <Ionicons
                        name={iconName}
                        size={80}
                        color={iconColor}
                    />
                </View>

                <Text style={styles.slideTitle}>
                    {isNotificationSlide && notificationStatus === 'granted'
                        ? '알림이 켜졌어요!'
                        : isNotificationSlide && notificationStatus === 'denied'
                            ? '알림이 꺼져 있어요'
                            : item.title}
                </Text>

                <Text style={styles.slideDescription}>
                    {isNotificationSlide && notificationStatus === 'granted'
                        ? '이제 예상치 못한 순간에\n따뜻한 위로가 찾아갈 거예요.'
                        : isNotificationSlide && notificationStatus === 'denied'
                            ? '설정에서 언제든 알림을 켤 수 있어요.\n일단 둘러보시고 나중에 켜도 돼요!'
                            : item.description}
                </Text>

                {isNicknameSlide && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="닉네임 입력"
                            value={nickname}
                            onChangeText={setNickname}
                            placeholderTextColor={Colors.textTertiary}
                            maxLength={10}
                            autoFocus={currentIndex === index} // 현재 슬라이드일 때만 포커스
                        />
                        <Text style={styles.inputHint}>최대 10자까지 입력 가능해요</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {SLIDES_WITH_EXTRAS.map((_, index) => {
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
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
                data={SLIDES_WITH_EXTRAS}
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
                scrollEnabled={false} // 버튼으로만 이동하도록 설정 (닉네임 확인 등을 위해)
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
                    {(() => {
                        const currentSlide = SLIDES_WITH_EXTRAS[currentIndex];
                        if ((currentSlide as any).isNotificationSlide) {
                            if (notificationStatus === 'granted' || notificationStatus === 'denied') return '시작하기';
                            return '알림 허용하기';
                        }
                        if (currentIndex === SLIDES_WITH_EXTRAS.length - 1) return '시작하기';
                        return '다음';
                    })()}
                </Button>
            </View>
        </KeyboardAvoidingView>
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
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    illustrationSuccess: {
        backgroundColor: Colors.success + '15',
    },
    illustrationWarning: {
        backgroundColor: Colors.warning + '15',
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
        minHeight: 84, // 3줄 높이 확보
    },
    inputContainer: {
        width: '100%',
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    input: {
        width: '80%',
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        fontSize: FontSize.xl,
        textAlign: 'center',
        paddingVertical: Spacing.sm,
        color: Colors.text,
    },
    inputHint: {
        marginTop: Spacing.sm,
        fontSize: FontSize.sm,
        color: Colors.textTertiary,
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
        borderRadius: BorderRadius.md,
    },
    buttonContent: {
        height: 56,
    },
    buttonLabel: {
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
});
