import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useDiaryStore } from '../../src/stores';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants';

export default function DiaryScreen() {
    const { entries, addEntry, getEntryByDate } = useDiaryStore();
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [showModal, setShowModal] = useState(false);
    const [gratitudeText, setGratitudeText] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date().toISOString().split('T')[0];
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

        // 빈 칸
        for (let i = 0; i < firstDay; i++) {
            days.push({ date: null, hasEntry: false });
        }

        // 날짜
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

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(month)}월 ${parseInt(day)}일`;
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>감사 일기 🙏</Text>
                        <Text style={styles.subtitle}>오늘 감사한 일을 기록해보세요</Text>
                    </View>
                    <View style={styles.viewToggle}>
                        <IconButton
                            icon="calendar"
                            selected={viewMode === 'calendar'}
                            onPress={() => setViewMode('calendar')}
                            iconColor={viewMode === 'calendar' ? Colors.primary : Colors.textTertiary}
                        />
                        <IconButton
                            icon="format-list-bulleted"
                            selected={viewMode === 'list'}
                            onPress={() => setViewMode('list')}
                            iconColor={viewMode === 'list' ? Colors.primary : Colors.textTertiary}
                        />
                    </View>
                </View>

                {/* 오늘 감사 기록 */}
                {!todayEntry ? (
                    <TouchableOpacity style={styles.todaySection} onPress={() => handleOpenModal()}>
                        <View style={styles.todayPrompt}>
                            <Text style={styles.todayEmoji}>✨</Text>
                            <View style={styles.todayTextContainer}>
                                <Text style={styles.sectionTitle}>오늘 감사한 일은?</Text>
                                <Text style={styles.todayHint}>탭하여 기록하기</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.todayRecorded}>
                        <Text style={styles.recordedEmoji}>🙏</Text>
                        <View style={styles.recordedInfo}>
                            <Text style={styles.recordedTitle}>오늘의 감사</Text>
                            <Text style={styles.recordedContent} numberOfLines={3}>
                                {todayEntry.content}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleOpenModal(todayEntry.content)}>
                            <Text style={styles.editButton}>수정</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 달력 또는 리스트 */}
                {viewMode === 'calendar' ? (
                    <View style={styles.calendarSection}>
                        <View style={styles.calendarHeader}>
                            <IconButton icon="chevron-left" onPress={() => changeMonth(-1)} />
                            <Text style={styles.calendarTitle}>
                                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                            </Text>
                            <IconButton icon="chevron-right" onPress={() => changeMonth(1)} />
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
                                                <Text style={styles.dayEmoji}>🙏</Text>
                                            )}
                                        </>
                                    )}
                                </View>
                            ))}
                        </View>

                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <Text style={styles.legendEmoji}>🙏</Text>
                                <Text style={styles.legendText}>감사 기록한 날</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.listSection}>
                        {[...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                            <View key={entry.id} style={styles.listItem}>
                                <View style={styles.listHeader}>
                                    <Text style={styles.listDate}>{formatDate(entry.date)}</Text>
                                    <Text style={styles.listEmoji}>🙏</Text>
                                </View>
                                <Text style={styles.listContent} numberOfLines={3}>
                                    {entry.content}
                                </Text>
                            </View>
                        ))}
                        {entries.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>📝</Text>
                                <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
                                <Text style={styles.emptyDesc}>오늘부터 감사 일기를 시작해보세요</Text>
                            </View>
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
                            placeholder="예: 맛있는 점심을 먹을 수 있어서 감사해요"
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
        </View>
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
        paddingTop: Spacing.xxl + Spacing.lg,
    },
    header: {
        marginBottom: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewToggle: {
        flexDirection: 'row',
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    todaySection: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.primary + '30',
        borderStyle: 'dashed',
    },
    todayPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    todayEmoji: {
        fontSize: 40,
        marginRight: Spacing.md,
    },
    todayTextContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    todayHint: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    todayRecorded: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    recordedEmoji: {
        fontSize: 32,
        marginRight: Spacing.md,
    },
    recordedInfo: {
        flex: 1,
    },
    recordedTitle: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: 4,
    },
    recordedContent: {
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 22,
    },
    editButton: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
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
    },
    calendarTitle: {
        fontSize: FontSize.lg,
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
    dayEmoji: {
        fontSize: 12,
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
    legendEmoji: {
        fontSize: 14,
        marginRight: 4,
    },
    legendText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
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
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    modalButton: {
        flex: 1,
    },
    listSection: {
        // marginTop: Spacing.md,
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
    listEmoji: {
        fontSize: 18,
    },
    listContent: {
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 22,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    emptyDesc: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
});
