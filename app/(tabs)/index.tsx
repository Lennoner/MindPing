import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { useUserStore } from '../../src/stores/userStore';
import { useMessageStore } from '../../src/stores/messageStore';
import { useDiaryStore } from '../../src/stores/diaryStore';
import { ScreenHeader } from '../../src/components';
import { formatDateWithDay } from '../../src/utils';
import { scheduleRandomDailyMessage } from '../../src/utils/notifications';

export default function HomeScreen() {
    const router = useRouter();
    const { user, preferredTimeSlots, notificationsEnabled } = useUserStore();
    const { todayMessage, hasTodayMessage } = useMessageStore();
    const { getEntryByDate, entries } = useDiaryStore();

    const today = new Date();
    const hour = today.getHours();
    const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '편안한 밤 되세요';
    const userName = user?.nickname || '사용자';
    const todayDateStr = today.toISOString().split('T')[0];
    const hasTodayEntry = !!getEntryByDate(todayDateStr);

    // 앱 시작 시 스케줄 점검 (Zustand hydration 완료 후 1회만 실행)
    useEffect(() => {
        let cancelled = false;

        const checkSchedule = async () => {
            const { notificationsEnabled: enabled, preferredTimeSlots: slots } = useUserStore.getState();
            if (!cancelled && enabled && slots.length > 0) {
                await scheduleRandomDailyMessage(slots);
            }
        };

        // 두 스토어 모두 hydration 완료 확인 후 스케줄링
        const messageHydrated = useMessageStore.persist.hasHydrated();
        const userHydrated = useUserStore.persist.hasHydrated();

        if (messageHydrated && userHydrated) {
            // 이미 hydrate 완료된 경우 즉시 실행
            checkSchedule();
        } else {
            // hydration 완료 대기
            const unsubMessage = useMessageStore.persist.onFinishHydration(() => {
                if (useUserStore.persist.hasHydrated()) checkSchedule();
            });
            const unsubUser = useUserStore.persist.onFinishHydration(() => {
                if (useMessageStore.persist.hasHydrated()) checkSchedule();
            });

            return () => {
                cancelled = true;
                unsubMessage();
                unsubUser();
            };
        }

        return () => { cancelled = true; };
    }, []);

    // 카테고리 라벨
    const getTagLabel = (type: string) => {
        const labels: Record<string, string> = {
            cognitive: '인지', mindfulness: '마음챙김', action: '실천',
            emotion: '감정', growth: '성장', relationship: '관계', selfcare: '자기돌봄',
        };
        return labels[type] || '메시지';
    };

    // 카테고리 색상
    const getTagColor = (type: string) => {
        const colors: Record<string, string> = {
            cognitive: Colors.categoryCognitive, mindfulness: Colors.categoryMindfulness,
            action: Colors.categoryAction, emotion: Colors.categoryEmotion,
            growth: Colors.categoryGrowth, relationship: Colors.categoryRelationship,
            selfcare: Colors.categorySelfcare,
        };
        return colors[type] || Colors.categoryDefault;
    };

    const handleShare = async () => {
        if (!todayMessage) return;
        try {
            await Share.share({
                message: `${todayMessage.content}\n\n- 마음알림 MindPing`,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };


    // 메시지가 없거나, 아직 받을 시간이 안 되었으면 대기 화면 표시
    const [currentTime, setCurrentTime] = useState(new Date());

    // 1분마다 시간 체크 (메시지 오픈 시간 확인용)
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const isMessageArrived = todayMessage && new Date(todayMessage.receivedAt) <= currentTime;

    if (!todayMessage || !isMessageArrived) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>
                        {todayMessage
                            ? '오늘의 메시지가 곧 도착해요...'
                            : '메시지를 준비하고 있어요...'}
                    </Text>
                    {todayMessage && (
                        <Text style={[styles.loadingText, { fontSize: 12, marginTop: 8 }]}>
                            도착 예정: {new Date(todayMessage.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    const NotificationAction = (
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push('/notification-settings')}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
    );

    const HeaderTitle = (
        <View style={styles.headerTitleContainer}>
            <Image source={require('../../assets/header-logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitleText}>마음알림</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader title={HeaderTitle} rightAction={NotificationAction} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.dateText}>{formatDateWithDay(today)}</Text>
                    <Text style={styles.greeting}>{greeting},</Text>
                    <Text style={styles.userName}>{userName}님</Text>
                </View>

                {/* 오늘의 메시지 카드 */}
                <View style={styles.messageCard}>
                    <LinearGradient
                        colors={[Colors.messageCardGradientStart, Colors.messageCardGradientEnd]}
                        style={styles.cardGradient}
                    >
                        <View style={styles.tagRow}>
                            <View style={[styles.tag, { backgroundColor: getTagColor(todayMessage.category) }]}>
                                <Text style={styles.tagText}>{getTagLabel(todayMessage.category)}</Text>
                            </View>
                        </View>

                        <Text style={styles.messageText}>{todayMessage.content}</Text>

                        <View style={styles.cardFooter}>
                            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                                <Ionicons name="share-outline" size={16} color={Colors.primary} />
                                <Text style={styles.shareText}>공유</Text>
                            </TouchableOpacity>
                            <Text style={styles.pingNumber}>PING #{todayMessage.id.padStart(3, '0')}</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* 오늘의 미션 */}
                <TouchableOpacity
                    style={[styles.missionCard, hasTodayEntry && styles.missionCardCompleted]}
                    onPress={() => router.push('/(tabs)/diary')}
                >
                    <View style={styles.missionContent}>
                        <Text style={styles.missionLabel}>
                            {hasTodayEntry ? '오늘의 미션 완료!' : '오늘의 미션'}
                        </Text>
                        <Text style={styles.missionTitle}>
                            {hasTodayEntry ? '감사 일기를 확인해보세요' : '오늘의 감사 기록하기'}
                        </Text>
                    </View>
                    <View style={styles.missionIcon}>
                        <Ionicons name={hasTodayEntry ? 'checkmark' : 'arrow-forward'} size={20} color={Colors.white} />
                    </View>
                </TouchableOpacity>

                {/* 팁 배너 */}
                {entries.length < 3 && (
                    <View style={styles.tipBanner}>
                        <View style={styles.tipIconContainer}>
                            <Ionicons name="sparkles" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>감사 일기의 힘</Text>
                            <Text style={styles.tipDescription}>
                                매일 감사한 일을 기록하면 행복감이 25% 증가하고,{'\n'}
                                스트레스가 줄어든다는 연구 결과가 있어요.
                            </Text>
                        </View>
                    </View>
                )}

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollView: { flex: 1, paddingHorizontal: Spacing.lg },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: FontSize.md, color: Colors.textSecondary },
    headerIconBtn: {
        width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
        borderRadius: 20, backgroundColor: Colors.surfaceVariant,
    },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
    headerLogo: { width: 32, height: 32, marginRight: 8 },
    headerTitleText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
    heroSection: { marginTop: Spacing.md, marginBottom: Spacing.xl },
    dateText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
    greeting: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, marginBottom: 2 },
    userName: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.primary },
    messageCard: {
        marginBottom: Spacing.md, borderRadius: BorderRadius.xl, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    },
    cardGradient: { padding: Spacing.lg },
    tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    tag: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
    tagText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '600' },
    messageText: { fontSize: FontSize.lg, fontWeight: '500', color: Colors.text, lineHeight: 28, marginBottom: Spacing.md },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    shareBtn: { flexDirection: 'row', alignItems: 'center' },
    shareText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginLeft: 4 },
    pingNumber: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', opacity: 0.8 },
    missionCard: {
        backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, padding: Spacing.lg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg,
    },
    missionCardCompleted: { backgroundColor: Colors.missionCompleted },
    missionContent: { flex: 1 },
    missionLabel: { fontSize: FontSize.xs, color: 'rgba(255, 255, 255, 0.8)', marginBottom: Spacing.xs },
    missionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.white },
    missionIcon: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    tipBanner: {
        flexDirection: 'row', backgroundColor: Colors.primary + '08', borderRadius: BorderRadius.lg,
        padding: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '15',
    },
    tipIconContainer: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '15',
        alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
    },
    tipContent: { flex: 1 },
    tipTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
    tipDescription: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
});
