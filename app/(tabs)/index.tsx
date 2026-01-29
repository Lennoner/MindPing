import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
                category: selectedMessage.type, // type이 이미 'question' | 'comfort' | 'wisdom'
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
            case 'question': return Colors.categoryQuestion;
            case 'comfort': return Colors.categoryComfort;
            case 'wisdom': return Colors.categoryWisdom;
            default: return Colors.categoryDefault;
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
                        <Ionicons name="notifications-outline" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* 오늘의 메시지 카드 */}
                <View style={styles.messageCard}>
                    <LinearGradient
                        colors={[Colors.messageCardGradientStart, Colors.messageCardGradientEnd]}
                        style={styles.cardGradient}
                    >
                        {/* 메시지 타입 태그 */}
                        <View style={styles.tagRow}>
                            <View style={[styles.tag, { backgroundColor: getTagColor(displayMessage.type) }]}>
                                <Text style={styles.tagText}>{getTagLabel(displayMessage.type)}</Text>
                            </View>
                        </View>

                        {/* 메시지 내용 */}
                        <Text style={styles.messageText}>{displayMessage.content}</Text>

                        {/* 하단 영역 */}
                        <View style={styles.cardFooter}>
                            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                                <Ionicons name="share-outline" size={16} color={Colors.primary} />
                                <Text style={styles.shareText}>공유</Text>
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
                            {hasTodayEntry ? '감사 일기를 확인해보세요' : '오늘의 감사 기록하기'}
                        </Text>
                    </View>
                    <View style={styles.missionIcon}>
                        <Ionicons
                            name={hasTodayEntry ? 'checkmark' : 'arrow-forward'}
                            size={20}
                            color={Colors.white}
                        />
                    </View>
                </TouchableOpacity>

                {/* 오늘의 팁 */}
                <View style={styles.tipCard}>
                    <View style={styles.tipHeader}>
                        <Ionicons name="bulb-outline" size={20} color={Colors.warning} />
                        <Text style={styles.tipLabel}>오늘의 팁</Text>
                    </View>
                    <Text style={styles.tipText}>
                        하루 5분 감사 일기를 쓰면 행복감이 25% 증가한다는 연구가 있어요. 작은 것부터 시작해보세요.
                    </Text>
                </View>

                <View style={{ height: Spacing.xl }} />
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
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
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
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardGradient: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        minHeight: 200, // 카드 높이 최소값 추가하여 강조
        justifyContent: 'space-between',
    },
    tagRow: {
        flexDirection: 'row',
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
        fontSize: FontSize.xl, // 폰트 크기 키움
        fontWeight: '600', // 굵기 강조
        color: Colors.text,
        lineHeight: 32, // 줄간격 조정
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
        padding: Spacing.sm, // 터치 영역 확대
    },
    shareIcon: {
        fontSize: 20, // 아이콘 크기 확대
        marginRight: Spacing.xs,
    },
    shareText: {
        fontSize: FontSize.md, // 텍스트 크기 확대
        color: Colors.textSecondary,
    },
    pingNumber: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '500',
    },
    missionCard: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    missionCardCompleted: {
        backgroundColor: Colors.missionCompleted,
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    missionEmoji: {
        fontSize: 18,
        color: Colors.white,
        fontWeight: '600',
    },
    tipCard: {
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    tipLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.warning,
        marginLeft: Spacing.xs,
    },
    tipText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});
