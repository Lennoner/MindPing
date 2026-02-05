import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { useMessageStore } from '../../src/stores/messageStore';
import { ScreenHeader, EmptyState } from '../../src/components';
import { formatDateKorean } from '../../src/utils';


export default function ArchiveScreen() {
    const { messages, toggleFavorite } = useMessageStore();
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // 실시간 시간 업데이트 (메시지 도착 확인용)
    const [currentTime, setCurrentTime] = useState(new Date());

    // 화면이 포커스될 때마다 시간 업데이트 (즉시 반영)
    useFocusEffect(
        useCallback(() => {
            setCurrentTime(new Date());
        }, [])
    );

    useEffect(() => {
        // 1분 간격으로 시간 체크 유지
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const archiveMessages = messages
        // 미래 시간 메시지 숨김 (receivedAt > currentTime)
        .filter(msg => new Date(msg.receivedAt) <= currentTime)
        .filter(msg => !showFavoritesOnly || msg.isFavorite)
        .map((msg) => {
            const receivedDate = new Date(msg.receivedAt);
            const isToday = receivedDate.toDateString() === currentTime.toDateString();

            return {
                ...msg,
                date: formatDateKorean(receivedDate),
                isToday,
            };
        });


    const getLineColor = (index: number) => {
        const colors = [
            Colors.categoryCognitive,
            Colors.categoryMindfulness,
            Colors.categoryAction,
            Colors.categoryEmotion,
            Colors.categoryGrowth,
            Colors.categoryRelationship,
            Colors.categorySelfcare,
        ];
        return colors[index % colors.length];
    };

    // 필터 토글 버튼 (통일된 스타일)
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
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader
                title="보관함"
                rightAction={FilterButton}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* 메시지 개수 표시 */}
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                        {showFavoritesOnly ? '즐겨찾기' : '받은 메시지'} {archiveMessages.length}개
                    </Text>
                </View>

                {archiveMessages.length === 0 ? (
                    <EmptyState
                        icon={showFavoritesOnly ? 'heart-outline' : 'mail-open-outline'}
                        title={showFavoritesOnly ? '즐겨찾기한 메시지가 없어요' : '아직 받은 메시지가 없어요'}
                        description={showFavoritesOnly ? '마음에 드는 메시지의 하트를 눌러보세요' : '알림을 설정하면 매일 따뜻한 메시지를 받을 수 있어요'}
                    />
                ) : (
                    archiveMessages.map((message, index) => (
                        <View key={message.id || index} style={styles.cardContainer}>
                            <View style={[styles.topStripe, { backgroundColor: getLineColor(index) }]} />
                            <View style={styles.cardContent}>
                                <View style={styles.dateRow}>
                                    <Text style={styles.date}>{message.date}</Text>
                                    {message.isToday && <Text style={styles.todayLabel}>오늘</Text>}
                                </View>

                                <TouchableOpacity
                                    style={styles.favoriteButton}
                                    onPress={() => toggleFavorite(message.id)}
                                >
                                    <Ionicons
                                        name={message.isFavorite ? 'heart' : 'heart-outline'}
                                        size={20}
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
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: Colors.surfaceVariant,
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
    },
    countBadge: {
        marginBottom: Spacing.md,
    },
    countText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    cardContainer: {
        marginBottom: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    topStripe: {
        height: 4,
        width: '100%',
    },
    cardContent: {
        padding: Spacing.lg,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
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
        top: Spacing.sm,
        right: Spacing.sm,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        fontSize: FontSize.md,
        color: '#4B5563', // 조금 더 부드러운 다크 그레이
        lineHeight: 24,   // 줄 간격 증가
        fontWeight: '500',
        paddingRight: Spacing.xl,
    },
});
