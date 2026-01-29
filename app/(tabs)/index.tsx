import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { SAMPLE_MESSAGES, MessageData } from '../../src/constants/data';
import { useUserStore } from '../../src/stores/userStore';
import { useMessageStore } from '../../src/stores/messageStore';
import { useDiaryStore } from '../../src/stores/diaryStore';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useUserStore();
    const { todayMessage, setTodayMessage } = useMessageStore();
    const { getEntryByDate } = useDiaryStore();

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = dayNames[today.getDay()];

    const hour = today.getHours();
    const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '편안한 밤 되세요';

    const userName = user?.nickname || '사용자';
    const todayDateStr = today.toISOString().split('T')[0];
    const hasTodayEntry = !!getEntryByDate(todayDateStr);

    // 오늘의 메시지가 없으면 랜덤으로 하나 선택
    const [displayMessage, setDisplayMessage] = useState<MessageData | null>(null);

    useEffect(() => {
        if (todayMessage) {
            // messageStore에 오늘의 메시지가 있으면 그것을 사용
            const foundMessage = SAMPLE_MESSAGES.find(m => m.id === todayMessage.id);
            if (foundMessage) {
                setDisplayMessage(foundMessage);
            } else {
                // 못찾으면 랜덤 선택
                const randomIndex = Math.floor(Math.random() * SAMPLE_MESSAGES.length);
                setDisplayMessage(SAMPLE_MESSAGES[randomIndex]);
            }
        } else {
            // 오늘의 메시지가 없으면 랜덤으로 하나 선택하고 저장
            const randomIndex = Math.floor(Math.random() * SAMPLE_MESSAGES.length);
            const selectedMessage = SAMPLE_MESSAGES[randomIndex];
            setDisplayMessage(selectedMessage);
            setTodayMessage({
                id: selectedMessage.id,
                content: selectedMessage.content,
                category: selectedMessage.type as any,
                receivedAt: new Date(),
                isRead: false,
            });
        }
    }, [todayMessage]);

    const getTagLabel = (type: string) => {
        switch (type) {
            case 'question': return '질문';
            case 'comfort': return '위로';
            case 'wisdom': return '지혜';
            default: return '메시지';
        }
    };

    const getTagColor = (type: string) => {
        switch (type) {
            case 'question': return '#6366F1';
            case 'comfort': return '#EC4899';
            case 'wisdom': return '#10B981';
            default: return Colors.primary;
        }
    };

    const handleShare = async () => {
        if (!displayMessage) return;
        try {
            await Share.share({
                message: `${displayMessage.content}\n\n- 마음알림 MindPing`,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const handleNotificationPress = () => {
        router.push('/notification-settings');
    };

    const handleMissionPress = () => {
        router.push('/(tabs)/diary');
    };

    if (!displayMessage) {
        return null;
    }

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
                    <TouchableOpacity style={styles.notificationBtn} onPress={handleNotificationPress}>
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
                            <View style={[styles.tag, { backgroundColor: getTagColor(displayMessage.type) }]}>
                                <Text style={styles.tagText}>{getTagLabel(displayMessage.type)}</Text>
                            </View>
                            <Text style={styles.sparkle}>{displayMessage.emoji}</Text>
                        </View>

                        {/* 메시지 내용 */}
                        <Text style={styles.messageText}>{displayMessage.content}</Text>

                        {/* 하단 영역 */}
                        <View style={styles.cardFooter}>
                            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                                <Text style={styles.shareIcon}>↗️</Text>
                                <Text style={styles.shareText}>공유하기</Text>
                            </TouchableOpacity>
                            <Text style={styles.pingNumber}>PING #{displayMessage.id.padStart(3, '0')}</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* 오늘의 미션 */}
                <TouchableOpacity
                    style={[styles.missionCard, hasTodayEntry && styles.missionCardCompleted]}
                    onPress={handleMissionPress}
                >
                    <View style={styles.missionContent}>
                        <Text style={styles.missionLabel}>
                            {hasTodayEntry ? '오늘의 미션 완료!' : '오늘의 미션'}
                        </Text>
                        <Text style={styles.missionTitle}>
                            {hasTodayEntry ? '감정 기록을 확인해보세요' : '오늘의 감정 기록하기'}
                        </Text>
                    </View>
                    <View style={styles.missionIcon}>
                        <Text style={styles.missionEmoji}>{hasTodayEntry ? '✅' : '✏️'}</Text>
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
    missionCardCompleted: {
        backgroundColor: '#22C55E',
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
