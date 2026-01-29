import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { SAMPLE_MESSAGES } from '../../src/constants/data';
import { useMessageStore } from '../../src/stores/messageStore';

export default function ArchiveScreen() {
    const { messages } = useMessageStore();

    // 메시지가 있으면 실제 데이터 사용, 없으면 빈 배열
    const archiveMessages = messages.map((msg, index) => {
        const receivedDate = new Date(msg.receivedAt);
        const today = new Date();
        const isToday = receivedDate.toDateString() === today.toDateString();

        // SAMPLE_MESSAGES에서 해당 메시지의 emoji 찾기
        const originalMessage = SAMPLE_MESSAGES.find(m => m.id === msg.id);
        const emoji = originalMessage?.emoji || '💜';

        return {
            ...msg,
            emoji,
            date: formatDate(receivedDate),
            isToday,
        };
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>보관함</Text>
                <Text style={styles.headerSubtitle}>받은 메시지 {archiveMessages.length}개</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {archiveMessages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>📭</Text>
                        <Text style={styles.emptyTitle}>아직 받은 메시지가 없어요</Text>
                        <Text style={styles.emptyDesc}>알림을 설정하면 매일 따뜻한 메시지를 받을 수 있어요</Text>
                    </View>
                ) : (
                    archiveMessages.map((message, index) => (
                        <View key={message.id || index} style={styles.cardContainer}>
                            {/* 왼쪽 라인 */}
                            <View style={[
                                styles.leftLine,
                                { backgroundColor: getLineColor(index) }
                            ]} />

                            <View style={styles.card}>
                                <View style={styles.dateRow}>
                                    <Text style={styles.date}>{message.date}</Text>
                                    {message.isToday && <Text style={styles.todayLabel}>오늘</Text>}
                                </View>

                                <Text style={styles.emoji}>{message.emoji}</Text>

                                <Text style={styles.content} numberOfLines={4}>{message.content}</Text>
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function formatDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
}

function getLineColor(index: number) {
    const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B'];
    return colors[index % colors.length];
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    headerSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
        padding: Spacing.lg,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptyDesc: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
    },
    cardContainer: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
        minHeight: 140,
    },
    leftLine: {
        width: 4,
        height: '100%',
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        marginRight: -2,
        zIndex: 1,
    },
    card: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        borderLeftWidth: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,

        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    date: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        fontWeight: '500',
    },
    todayLabel: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
        marginLeft: Spacing.xs,
    },
    emoji: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        fontSize: 20,
    },
    content: {
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 24,
        fontWeight: '500',
        marginTop: Spacing.xs,
    },
});
