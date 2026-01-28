import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { SAMPLE_MESSAGES } from '../../src/constants/data';
import { useUserStore } from '../../src/stores/userStore';

// 날짜 기반 시드로 같은 날에는 같은 메시지 표시
const getDailyMessageIndex = (date: Date): number => {
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    return seed % SAMPLE_MESSAGES.length;
};

const getMessageTypeLabel = (type: string): string => {
    switch (type) {
        case 'wisdom': return '지혜';
        case 'comfort': return '위로';
        case 'question': return '질문';
        default: return '메시지';
    }
};

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useUserStore();
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = dayNames[today.getDay()];

    const hour = today.getHours();
    const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '편안한 밤 되세요';

    // 날짜 기반 랜덤 메시지 (같은 날에는 같은 메시지)
    const todayMessage = useMemo(() => {
        const index = getDailyMessageIndex(today);
        return SAMPLE_MESSAGES[index];
    }, [today.toDateString()]);

    const userName = user?.nickname || '사용자';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.dateText}>{month}월 {day}일 {dayName}</Text>
                        <View style={styles.greetingRow}>
                            <Text style={styles.greeting}>{greeting},</Text>
                        </View>
                        <Text style={styles.userName}>{userName}님</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notificationBtn}
                        onPress={() => router.push('/notification-settings')}
                    >
                        <Text style={styles.notificationIcon}>🔔</Text>
                    </TouchableOpacity>
                </View>

                {/* 오늘의 메시지 카드 */}
                <View style={styles.messageCard}>
                    <LinearGradient
                        colors={['#F8F7FF', '#F0EEFF']}
                        style={styles.cardGradient}
                    >
                        {/* 메시지 타입 태그 */}
                        <View style={styles.tagRow}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{getMessageTypeLabel(todayMessage.type)}</Text>
                            </View>
                            <Text style={styles.sparkle}>{todayMessage.emoji}</Text>
                        </View>

                        {/* 메시지 내용 */}
                        <Text style={styles.messageText}>{todayMessage.content}</Text>

                        {/* 하단 영역 */}
                        <View style={styles.cardFooter}>
                            <TouchableOpacity style={styles.shareBtn}>
                                <Text style={styles.shareIcon}>↗️</Text>
                                <Text style={styles.shareText}>공유하기</Text>
                            </TouchableOpacity>
                            <Text style={styles.pingNumber}>PING #{todayMessage.id.padStart(3, '0')}</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* 오늘의 미션 - 일기 탭으로 이동 */}
                <TouchableOpacity
                    style={styles.missionCard}
                    onPress={() => router.push('/(tabs)/diary')}
                >
                    <View style={styles.missionContent}>
                        <Text style={styles.missionLabel}>오늘의 미션</Text>
                        <Text style={styles.missionTitle}>오늘의 감정 기록하기</Text>
                    </View>
                    <View style={styles.missionIcon}>
                        <Text style={styles.missionEmoji}>✏️</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
    },
    dateText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greeting: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.text,
    },
    userName: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.primary,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    notificationIcon: {
        fontSize: 20,
        opacity: 0.6,
    },
    messageCard: {
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    cardGradient: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
    },
    tagRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    tag: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    tagText: {
        fontSize: FontSize.sm,
        color: Colors.white,
        fontWeight: '600',
    },
    sparkle: {
        fontSize: 20,
    },
    messageText: {
        fontSize: FontSize.xl,
        fontWeight: '600',
        color: Colors.text,
        lineHeight: 32,
        marginBottom: Spacing.xl,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shareIcon: {
        fontSize: 16,
        marginRight: Spacing.xs,
    },
    shareText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    pingNumber: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '500',
    },
    missionCard: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    missionContent: {
        flex: 1,
    },
    missionLabel: {
        fontSize: FontSize.xs,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: Spacing.xs,
    },
    missionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.white,
    },
    missionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    missionEmoji: {
        fontSize: 24,
    },
});
