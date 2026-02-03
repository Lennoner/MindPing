import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Image } from 'react-native';
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
import { ScreenHeader } from '../../src/components';
import { formatDateWithDay } from '../../src/utils';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useUserStore();
    const { todayMessage, setTodayMessage } = useMessageStore();
    const { getEntryByDate, entries } = useDiaryStore();

    const today = new Date();
    const hour = today.getHours();
    const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '편안한 밤 되세요';

    const userName = user?.nickname || '사용자';
    const todayDateStr = today.toISOString().split('T')[0];
    const hasTodayEntry = !!getEntryByDate(todayDateStr);

    const [displayMessage, setDisplayMessage] = useState<MessageData | null>(null);

    useEffect(() => {
        if (todayMessage) {
            const foundMessage = SAMPLE_MESSAGES.find(m => m.id === todayMessage.id);
            if (foundMessage) {
                setDisplayMessage(foundMessage);
            } else {
                const randomIndex = Math.floor(Math.random() * SAMPLE_MESSAGES.length);
                setDisplayMessage(SAMPLE_MESSAGES[randomIndex]);
            }
        } else {
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

    // 헤더 우측 알림 버튼 (통일된 40x40 사이즈)
    const NotificationAction = (
        <TouchableOpacity style={styles.headerIconBtn} onPress={handleNotificationPress}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
    );

    // 헤더 타이틀 (로고 + 텍스트)
    const HeaderTitle = (
        <View style={styles.headerTitleContainer}>
            <Image
                source={require('../../assets/header-logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
            />
            <Text style={styles.headerTitleText}>마음알림</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 통일된 헤더 */}
            <ScreenHeader
                title={HeaderTitle}
                rightAction={NotificationAction}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Section (날짜/인사말) */}
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
                            <View style={[styles.tag, { backgroundColor: getTagColor(displayMessage.type) }]}>
                                <Text style={styles.tagText}>{getTagLabel(displayMessage.type)}</Text>
                            </View>
                        </View>

                        <Text style={styles.messageText}>{displayMessage.content}</Text>

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

                {/* 감사 일기의 힘 배너 (기록 3개 미만일 때만) */}
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

                {/* 하단 여백 */}
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
    headerIconBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: Colors.surfaceVariant,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogo: {
        width: 28,
        height: 28,
        marginRight: 10,
    },
    headerTitleText: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.text,
    },
    heroSection: {
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
    },
    dateText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    greeting: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 2,
    },
    userName: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.primary,
    },
    messageCard: {
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    cardGradient: {
        padding: Spacing.lg,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    tag: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    tagText: {
        fontSize: FontSize.xs,
        color: Colors.white,
        fontWeight: '600',
    },
    messageText: {
        fontSize: FontSize.lg,
        fontWeight: '500',
        color: Colors.text,
        lineHeight: 28,
        marginBottom: Spacing.md,
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
    shareText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    pingNumber: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
        opacity: 0.8,
    },
    missionCard: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
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
        fontSize: FontSize.md,
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
    // 감사 일기의 힘 배너
    tipBanner: {
        flexDirection: 'row',
        backgroundColor: Colors.primary + '08',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.primary + '15',
    },
    tipIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 4,
    },
    tipDescription: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
});
