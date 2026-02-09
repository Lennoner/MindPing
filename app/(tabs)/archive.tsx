import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { useMessageStore, Message } from '../../src/stores/messageStore';
import { ScreenHeader, EmptyState } from '../../src/components';
import { formatDateKorean } from '../../src/utils';


export default function ArchiveScreen() {
    const { messages, toggleFavorite } = useMessageStore();
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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
    // selectedMessageId가 설정되어 있어도, 리스트에서 찾을 수 없다면(필터링 등) null 처리
    const activeMessage = selectedMessageId
        ? archiveMessages.find(m => m.id === selectedMessageId) || messages.find(m => m.id === selectedMessageId)
        // fallback to generic store search if filtered out from archiveMessages (e.g. by 'favorites only' toggle while open? unlikely but safe)
        : null;

    // activeMessage가 일반 message 객체일 경우 date 포맷팅이 안되어 있을 수 있으므로 방어 로직 필요
    // 하지만 UI 단순화를 위해 모달 렌더링 시 처리

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
                        <TouchableOpacity
                            key={message.id || index}
                            style={styles.cardContainer}
                            activeOpacity={0.9}
                            onPress={() => setSelectedMessageId(message.id)}
                        >
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
                        </TouchableOpacity>
                    ))
                )}
                <View style={{ height: Spacing.lg }} />
            </ScrollView>

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
                                                    {'date' in activeMessage ? activeMessage.date : formatDateKorean(new Date(activeMessage.receivedAt))}
                                                </Text>
                                                {'isToday' in activeMessage && activeMessage.isToday && <Text style={styles.todayLabel}>오늘</Text>}
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
