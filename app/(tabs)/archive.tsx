import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { SAMPLE_MESSAGES } from '../../src/constants/data';
import { useMessageStore } from '../../src/stores/messageStore';
import { ScreenHeader, EmptyState } from '../../src/components';
import { formatDateKorean } from '../../src/utils';

export default function ArchiveScreen() {
    const { messages, toggleFavorite } = useMessageStore();
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // 메시지가 있으면 실제 데이터 사용, 없으면 빈 배열
    const archiveMessages = messages
        .filter(msg => !showFavoritesOnly || msg.isFavorite)
        .map((msg) => {
            const receivedDate = new Date(msg.receivedAt);
            const today = new Date();
            const isToday = receivedDate.toDateString() === today.toDateString();

            // SAMPLE_MESSAGES에서 해당 메시지의 emoji 찾기
            const originalMessage = SAMPLE_MESSAGES.find(m => m.id === msg.id);
            const emoji = originalMessage?.emoji || '💜';

            return {
                ...msg,
                emoji,
                date: formatDateKorean(receivedDate),
                isToday,
            };
        });

    // 카테고리 기반 라인 색상
    const getLineColor = (index: number) => {
        const colors = [
            Colors.categoryQuestion,
            Colors.categoryComfort,
            Colors.categoryWisdom,
            Colors.categoryDefault,
        ];
        return colors[index % colors.length];
    };

    // 필터 토글 버튼
    const FilterButton = (
        <TouchableOpacity
            style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
            <Ionicons
                name={showFavoritesOnly ? 'heart' : 'heart-outline'}
                size={18}
                color={showFavoritesOnly ? Colors.white : Colors.primary}
            />
            <Text style={[styles.filterButtonText, showFavoritesOnly && styles.filterButtonTextActive]}>
                즐겨찾기
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 통일된 헤더 */}
            <ScreenHeader
                title="보관함"
                subtitle={`받은 메시지 ${messages.length}개`}
                rightAction={FilterButton}
                showBorder
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {archiveMessages.length === 0 ? (
                    <EmptyState
                        icon={showFavoritesOnly ? 'heart-outline' : 'mail-open-outline'}
                        title={showFavoritesOnly ? '즐겨찾기한 메시지가 없어요' : '아직 받은 메시지가 없어요'}
                        description={showFavoritesOnly ? '마음에 드는 메시지의 하트를 눌러보세요' : '알림을 설정하면 매일 따뜻한 메시지를 받을 수 있어요'}
                    />
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

                                {/* 즐겨찾기 버튼 */}
                                <TouchableOpacity
                                    style={styles.favoriteButton}
                                    onPress={() => toggleFavorite(message.id)}
                                >
                                    <Ionicons
                                        name={message.isFavorite ? 'heart' : 'heart-outline'}
                                        size={22}
                                        color={message.isFavorite ? Colors.primary : Colors.textTertiary}
                                    />
                                </TouchableOpacity>

                                <Text style={styles.content} numberOfLines={4}>{message.content}</Text>
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: Spacing.lg }} />
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
        padding: Spacing.lg,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
    },
    filterButtonText: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    filterButtonTextActive: {
        color: Colors.white,
    },
    cardContainer: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
        minHeight: 120,
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
        backgroundColor: Colors.surface,
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
    favoriteButton: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        padding: Spacing.xs,
    },
    content: {
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 24,
        fontWeight: '500',
        marginTop: Spacing.xs,
        paddingRight: Spacing.xl,
    },
});

