import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDiaryStore } from '../../src/stores';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants';
import { ScreenHeader, EmptyState, IconButton } from '../../src/components';
import { formatISODateKorean, getTodayISO } from '../../src/utils';

export default function DiaryScreen() {
    const { entries, addEntry, getEntryByDate } = useDiaryStore();
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [showModal, setShowModal] = useState(false);
    const [gratitudeText, setGratitudeText] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = getTodayISO();
    const todayEntry = getEntryByDate(today);

    const handleCloseModal = () => {
        setShowModal(false);
        setGratitudeText('');
    };

    const handleSave = () => {
        if (gratitudeText.trim()) {
            addEntry(gratitudeText.trim());
            handleCloseModal();
        }
    };

    const handleOpenModal = (existingContent?: string) => {
        if (existingContent) {
            setGratitudeText(existingContent);
        }
        setShowModal(true);
    };

    // 달력 생성
    const generateCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push({ date: null, hasEntry: false });
        }

        for (let i = 1; i <= lastDate; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const entry = entries.find(e => e.date === dateStr);
            days.push({
                date: i,
                dateStr,
                hasEntry: !!entry,
            });
        }

        return days;
    };

    const changeMonth = (delta: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + delta);
            return newDate;
        });
    };

    // 헤더 우측 토글 버튼 (통일된 스타일)
    const ViewToggle = (
        <View style={styles.viewToggle}>
            <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleBtnActive]}
                onPress={() => setViewMode('calendar')}
            >
                <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={viewMode === 'calendar' ? Colors.white : Colors.textSecondary}
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
                onPress={() => setViewMode('list')}
            >
                <Ionicons
                    name="list-outline"
                    size={18}
                    color={viewMode === 'list' ? Colors.white : Colors.textSecondary}
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader
                title="감사 일기"
                rightAction={ViewToggle}
            />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* 감사일기 효과 설명 배너 */}
                {entries.length < 3 && (
                    <View style={styles.effectBanner}>
                        <View style={styles.effectIconContainer}>
                            <Ionicons name="sparkles" size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.effectTextContainer}>
                            <Text style={styles.effectTitle}>감사 일기의 힘</Text>
                            <Text style={styles.effectDescription}>
                                매일 감사한 일을 기록하면 행복감이 25% 증가하고,{'\n'}
                                스트레스가 줄어든다는 연구 결과가 있어요.
                            </Text>
                        </View>
                    </View>
                )}

                {/* 오늘 감사 기록 */}
                {!todayEntry ? (
                    <TouchableOpacity style={styles.todaySection} onPress={() => handleOpenModal()}>
                        <View style={styles.todayPrompt}>
                            <View style={styles.todayIconContainer}>
                                <Ionicons name="add" size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.todayTextContainer}>
                                <Text style={styles.sectionTitle}>오늘 감사한 일은?</Text>
                                <Text style={styles.todayHint}>탭하여 기록하기</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.todayRecorded}>
                        <View style={styles.recordedIconContainer}>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                        </View>
                        <View style={styles.recordedInfo}>
                            <Text style={styles.recordedTitle}>오늘의 감사</Text>
                            <Text style={styles.recordedContent} numberOfLines={3}>
                                {todayEntry.content}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => handleOpenModal(todayEntry.content)}
                        >
                            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* 달력 또는 리스트 */}
                {viewMode === 'calendar' ? (
                    <View style={styles.calendarSection}>
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity
                                style={styles.monthNavBtn}
                                onPress={() => changeMonth(-1)}
                            >
                                <Ionicons name="chevron-back" size={20} color={Colors.text} />
                            </TouchableOpacity>
                            <Text style={styles.calendarTitle}>
                                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                            </Text>
                            <TouchableOpacity
                                style={styles.monthNavBtn}
                                onPress={() => changeMonth(1)}
                            >
                                <Ionicons name="chevron-forward" size={20} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weekDays}>
                            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                                <Text key={day} style={styles.weekDay}>{day}</Text>
                            ))}
                        </View>

                        <View style={styles.calendarGrid}>
                            {generateCalendar().map((day, index) => (
                                <View key={index} style={styles.calendarDay}>
                                    {day.date && (
                                        <>
                                            <Text style={[
                                                styles.dayNumber,
                                                day.dateStr === today && styles.dayNumberToday
                                            ]}>
                                                {day.date}
                                            </Text>
                                            {day.hasEntry && (
                                                <View style={styles.dayDot} />
                                            )}
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>

                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={styles.legendDot} />
                                <Text style={styles.legendText}>기록한 날</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.listSection}>
                        {entries.length === 0 ? (
                            <EmptyState
                                icon="document-text-outline"
                                title="아직 기록이 없어요"
                                description="오늘부터 감사 일기를 시작해보세요"
                            />
                        ) : (
                            [...entries]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((entry) => (
                                    <View key={entry.id} style={styles.listItem}>
                                        <View style={styles.listHeader}>
                                            <Text style={styles.listDate}>
                                                {formatISODateKorean(entry.date)}
                                            </Text>
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={18}
                                                color={Colors.success}
                                            />
                                        </View>
                                        <Text style={styles.listContent} numberOfLines={3}>
                                            {entry.content}
                                        </Text>
                                    </View>
                                ))
                        )}
                    </View>
                )}
            </ScrollView>

            {/* 감사 기록 모달 */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>오늘의 감사 기록</Text>
                        <Text style={styles.modalSubtitle}>
                            오늘 감사했던 일, 사람, 순간을 적어보세요
                        </Text>

                        <TextInput
                            style={styles.gratitudeInput}
                            placeholder="아침에 눈을 뜰 수 있었던 것, 따뜻한 햇살, 맛있는 커피 한 잔... 작은 것부터 시작해보세요 ✨"
                            value={gratitudeText}
                            onChangeText={setGratitudeText}
                            multiline
                            maxLength={500}
                            placeholderTextColor={Colors.textTertiary}
                            autoFocus
                        />
                        <Text style={styles.charCount}>{gratitudeText.length}/500</Text>

                        <View style={styles.modalButtons}>
                            <Button
                                mode="outlined"
                                onPress={handleCloseModal}
                                style={styles.modalButton}
                            >
                                취소
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSave}
                                disabled={!gratitudeText.trim()}
                                style={styles.modalButton}
                            >
                                저장
                            </Button>
                        </View>
                    </View>
                </View>
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
    },
    content: {
        padding: Spacing.lg,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.md,
        padding: 2,
    },
    toggleBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.sm,
    },
    toggleBtnActive: {
        backgroundColor: Colors.primary,
    },
    effectBanner: {
        flexDirection: 'row',
        backgroundColor: Colors.primary + '08',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.primary + '15',
    },
    effectIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    effectTextContainer: {
        flex: 1,
    },
    effectTitle: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 4,
    },
    effectDescription: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    todaySection: {
        marginBottom: Spacing.lg,
    },
    todayPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.primary + '30',
        borderStyle: 'dashed',
    },
    todayIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    todayTextContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    todayHint: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    todayRecorded: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    recordedIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.success + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    recordedInfo: {
        flex: 1,
    },
    recordedTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.success,
        marginBottom: 4,
    },
    recordedContent: {
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 22,
    },
    editBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarSection: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    monthNavBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        backgroundColor: Colors.surfaceVariant,
    },
    calendarTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    weekDays: {
        flexDirection: 'row',
        marginTop: Spacing.sm,
    },
    weekDay: {
        flex: 1,
        textAlign: 'center',
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.sm,
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNumber: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    dayNumberToday: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    dayDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginTop: 2,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginRight: 6,
    },
    legendText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    listSection: {
        minHeight: 200,
    },
    listItem: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    listDate: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
    listContent: {
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 22,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    modalTitle: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    modalSubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    gratitudeInput: {
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        height: 150,
        textAlignVertical: 'top',
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 24,
    },
    charCount: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.lg,
        gap: Spacing.md,
    },
    modalButton: {
        flex: 1,
        borderRadius: BorderRadius.md,
    },
});
