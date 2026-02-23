import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { useMessageStore, Message, MessageCategory } from '../../src/stores/messageStore';
import { ScreenHeader, EmptyState } from '../../src/components';
import { formatDateKorean } from '../../src/utils';


export default function ArchiveScreen() {
    const { messages, toggleFavorite } = useMessageStore();
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<MessageCategory | null>(null);

    // 선택된 메시지 ID (모달용) - 객체 대신 ID를 저장하여 스토어 업데이트 시 반응형 유지
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

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
        .filter(msg => !selectedCategory || msg.category === selectedCategory)
        .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()) // 최신순 정렬 보장
        .map((msg) => {
            const receivedDate = new Date(msg.receivedAt);
            const isToday = receivedDate.toDateString() === currentTime.toDateString();

            return {
                ...msg,
                date: formatDateKorean(receivedDate),
                isToday,
            };
        });

    // 선택된 메시지 객체 찾기 (스토어 상태 반영을 위해 매 렌더링마다 찾음)
    const activeMessage = (() => {
        if (!selectedMessageId) return null;
        // archiveMessages에서 먼저 찾기 (date, isToday 포함)
        const fromArchive = archiveMessages.find(m => m.id === selectedMessageId);
        if (fromArchive) return fromArchive;
        // fallback: 필터링으로 숨겨진 경우 원본에서 찾아서 date/isToday 계산
        const fromStore = messages.find(m => m.id === selectedMessageId);
        if (fromStore) {
            const receivedDate = new Date(fromStore.receivedAt);
            return {
                ...fromStore,
                date: formatDateKorean(receivedDate),
                isToday: receivedDate.toDateString() === currentTime.toDateString(),
            };
        }
        return null;
    })();

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

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'cognitive': return Colors.categoryCognitive;
            case 'mindfulness': return Colors.categoryMindfulness;
            case 'action': return Colors.categoryAction;
            case 'emotion': return Colors.categoryEmotion;
            case 'growth': return Colors.categoryGrowth;
            case 'relationship': return Colors.categoryRelationship;
            case 'selfcare': return Colors.categorySelfcare;
            default: return Colors.categoryDefault;
        }
    };

    const CATEGORY_LABELS: Record<string, string> = {
        cognitive: '인지/심리',
        mindfulness: '마음챙김',
        action: '실천',
        emotion: '감정',
        growth: '성장',
        relationship: '관계',
        selfcare: '자기돌봄',
    };

    const CATEGORY_EMOJI: Record<string, string> = {
        cognitive: '🧠',
        mindfulness: '🧘',
        action: '⚡',
        emotion: '💜',
        growth: '🌱',
        relationship: '🤝',
        selfcare: '☕',
    };

    const ALL_CATEGORIES: MessageCategory[] = ['cognitive', 'mindfulness', 'action', 'emotion', 'growth', 'relationship', 'selfcare'];

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

            <FlatList
                data={archiveMessages}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        {/* 카테고리 필터 칩 */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoryFilterContainer}
                            contentContainerStyle={styles.categoryFilterContent}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.categoryChip,
                                    !selectedCategory && styles.categoryChipActive,
                                ]}
                                onPress={() => setSelectedCategory(null)}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    !selectedCategory && styles.categoryChipTextActive,
                                ]}>전체</Text>
                            </TouchableOpacity>
                            {ALL_CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === cat && {
                                            backgroundColor: getCategoryColor(cat),
                                            borderColor: getCategoryColor(cat),
                                        },
                                    ]}
                                    onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                >
                                    <Text style={[
                                        styles.categoryChipText,
                                        selectedCategory === cat && styles.categoryChipTextActive,
                                    ]}>{CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* 메시지 개수 표시 */}
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>
                                {showFavoritesOnly && selectedCategory ? `즐겨찾기 · ${CATEGORY_LABELS[selectedCategory]}` : showFavoritesOnly ? '즐겨찾기' : selectedCategory ? CATEGORY_LABELS[selectedCategory] : '받은 메시지'} {archiveMessages.length}개
                            </Text>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <EmptyState
                        icon={showFavoritesOnly ? 'heart-outline' : 'mail-open-outline'}
                        title={showFavoritesOnly ? '즐겨찾기한 메시지가 없어요' : '아직 받은 메시지가 없어요'}
                        description={showFavoritesOnly ? '마음에 드는 메시지의 하트를 눌러보세요' : '알림을 설정하면 매일 따뜻한 메시지를 받을 수 있어요'}
                    />
                }
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={styles.cardContainer}
                        activeOpacity={0.9}
                        onPress={() => setSelectedMessageId(item.id)}
                    >
                        <View style={[styles.topStripe, { backgroundColor: getLineColor(index) }]} />
                        <View style={styles.cardContent}>
                            <View style={styles.dateRow}>
                                <Text style={styles.date}>{item.date}</Text>
                                {item.isToday && <Text style={styles.todayLabel}>오늘</Text>}
                            </View>

                            <TouchableOpacity
                                style={styles.favoriteButton}
                                onPress={() => toggleFavorite(item.id)}
                            >
                                <Ionicons
                                    name={item.isFavorite ? 'heart' : 'heart-outline'}
                                    size={20}
                                    color={item.isFavorite ? Colors.primary : Colors.textTertiary}
                                />
                            </TouchableOpacity>

                            <Text style={styles.content} numberOfLines={4}>{item.content}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListFooterComponent={<View style={{ height: Spacing.lg }} />}
            />

            {/* 메시지 상세 모달 */}
            <Modal
                visible={!!activeMessage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedMessageId(null)}
            >
                <TouchableWithoutFeedback onPress={() => setSelectedMessageId(null)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                {activeMessage && (
                                    <>
                                        <View style={styles.modalHeader}>
                                            <View style={styles.dateRow}>
                                                <Text style={styles.date}>
                                                    {activeMessage.date}
                                                </Text>
                                                {activeMessage.isToday && <Text style={styles.todayLabel}>오늘</Text>}
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => setSelectedMessageId(null)}
                                                style={styles.closeButton}
                                            >
                                                <Ionicons name="close" size={24} color={Colors.textSecondary} />
                                            </TouchableOpacity>
                                        </View>

                                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                            <Text style={styles.modalText}>
                                                {activeMessage.content}
                                            </Text>
                                            <View style={{ height: Spacing.xl }} />
                                        </ScrollView>

                                        <View style={styles.modalFooter}>
                                            {/* 왼쪽: 카테고리 정보 */}
                                            <View style={styles.categoryContainer}>
                                                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(activeMessage.category) }]} />
                                                <Text style={styles.categoryText}>
                                                    {CATEGORY_LABELS[activeMessage.category] || activeMessage.category}
                                                </Text>
                                            </View>

                                            {/* 오른쪽: 즐겨찾기 버튼 */}
                                            <TouchableOpacity
                                                style={styles.modalFavoriteButton}
                                                onPress={() => toggleFavorite(activeMessage.id)}
                                            >
                                                <Ionicons
                                                    name={activeMessage.isFavorite ? 'heart' : 'heart-outline'}
                                                    size={24}
                                                    color={activeMessage.isFavorite ? Colors.primary : Colors.textTertiary}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContent: {
        padding: Spacing.lg,
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
    categoryFilterContainer: {
        marginBottom: Spacing.md,
        marginHorizontal: -Spacing.lg,
    },
    categoryFilterContent: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        backgroundColor: Colors.surface,
    },
    categoryChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryChipText: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    categoryChipTextActive: {
        color: Colors.white,
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
        zIndex: 1, // 버튼이 터치 가능하도록
    },
    content: {
        fontSize: FontSize.md,
        color: '#4B5563', // 조금 더 부드러운 다크 그레이
        lineHeight: 24,   // 줄 간격 증가
        fontWeight: '500',
        paddingRight: Spacing.xl,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    modalBody: {
        // flexShrink: 1,
    },
    modalText: {
        fontSize: FontSize.lg,
        color: Colors.text,
        lineHeight: 28,
        fontWeight: '500',
    },
    modalFooter: {
        marginTop: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between', // 양쪽 정렬 (카테고리 <-> 하트)
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.md,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.sm,
    },
    categoryText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    modalFavoriteButton: {
        padding: Spacing.sm,
    },
});
