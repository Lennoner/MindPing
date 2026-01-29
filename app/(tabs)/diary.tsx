import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useDiaryStore } from '../../src/stores';
import { Colors, FontSize, Spacing, BorderRadius, EMOTIONS, EmotionType } from '../../src/constants';

export default function DiaryScreen() {
    const { entries, addEntry, getEntryByDate } = useDiaryStore();
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [showModal, setShowModal] = useState(false);
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
    const [memo, setMemo] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date().toISOString().split('T')[0];
    const todayEntry = getEntryByDate(today);

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEmotion(null);
        setMemo('');
    };

    const handleSave = () => {
        if (selectedEmotion) {
            addEntry(selectedEmotion, memo.trim() || undefined);
            handleCloseModal();
        }
    };

    const handleOpenModal = (emotion?: EmotionType, existingMemo?: string) => {
        if (emotion) {
            setSelectedEmotion(emotion);
        }
        if (existingMemo !== undefined) {
            setMemo(existingMemo);
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
            days.push({ date: null, emotion: null });
        }

        // 날짜
        for (let i = 1; i <= lastDate; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const entry = entries.find(e => e.date === dateStr);
            days.push({
                date: i,
                dateStr,
                emotion: entry?.emotion || null,
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

    const getEmotionEmoji = (type: EmotionType | null) => {
        if (!type) return null;
        return EMOTIONS.find(e => e.type === type)?.emoji;
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>감정 일기 📝</Text>
                        <Text style={styles.subtitle}>오늘 하루를 기록해보세요</Text>
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

                {/* 오늘 감정 기록 */}
                {!todayEntry ? (
                    <View style={styles.todaySection}>
                        <Text style={styles.sectionTitle}>오늘의 기분은?</Text>
                        <View style={styles.emotionSelector}>
                            {EMOTIONS.map((emotion) => (
                                <TouchableOpacity
                                    key={emotion.type}
                                    style={styles.emotionOption}
                                    onPress={() => handleOpenModal(emotion.type)}
                                >
                                    <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                                    <Text style={styles.emotionLabel}>{emotion.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.todayRecorded}>
                        <Text style={styles.recordedEmoji}>{getEmotionEmoji(todayEntry.emotion)}</Text>
                        <View style={styles.recordedInfo}>
                            <Text style={styles.recordedTitle}>오늘 기록 완료!</Text>
                            {todayEntry.memo && (
                                <Text style={styles.recordedMemo} numberOfLines={2}>
                                    {todayEntry.memo}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => handleOpenModal(todayEntry.emotion, todayEntry.memo || '')}>
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
                                <TouchableOpacity
                                    key={index}
                                    style={styles.calendarDay}
                                    onPress={() => {
                                        // TODO: 과거 날짜 클릭 시 상세 보기 또는 수정
                                    }}
                                >
                                    {day.date && (
                                        <>
                                            <Text style={[
                                                styles.dayNumber,
                                                day.dateStr === today && styles.dayNumberToday
                                            ]}>
                                                {day.date}
                                            </Text>
                                            {day.emotion && (
                                                <Text style={styles.dayEmoji}>{getEmotionEmoji(day.emotion)}</Text>
                                            )}
                                        </>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.listSection}>
                        {[...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                            <View key={entry.id} style={styles.listItem}>
                                <Text style={styles.listDate}>{entry.date}</Text>
                                <View style={styles.listContent}>
                                    <Text style={styles.listEmoji}>{getEmotionEmoji(entry.emotion)}</Text>
                                    {entry.memo && (
                                        <Text style={styles.listMemo} numberOfLines={2}>{entry.memo}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                        {entries.length === 0 && (
                            <Text style={styles.emptyList}>아직 기록된 일기가 없어요.</Text>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* 감정 기록 모달 */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>오늘의 감정 기록</Text>

                        <View style={styles.emotionSelector}>
                            {EMOTIONS.map((emotion) => (
                                <TouchableOpacity
                                    key={emotion.type}
                                    style={[
                                        styles.emotionOption,
                                        selectedEmotion === emotion.type && styles.emotionOptionSelected
                                    ]}
                                    onPress={() => setSelectedEmotion(emotion.type)}
                                >
                                    <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                                    <Text style={[
                                        styles.emotionLabel,
                                        selectedEmotion === emotion.type && styles.emotionLabelSelected
                                    ]}>{emotion.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={styles.memoInput}
                            placeholder="오늘 하루는 어땠나요? (선택)"
                            value={memo}
                            onChangeText={setMemo}
                            multiline
                            maxLength={200}
                            placeholderTextColor={Colors.textTertiary}
                        />
                        <Text style={styles.charCount}>{memo.length}/200</Text>

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
                                disabled={!selectedEmotion}
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
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    emotionSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    emotionOption: {
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    emotionOptionSelected: {
        backgroundColor: Colors.primaryLight + '30',
    },
    emotionEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    emotionLabel: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    emotionLabelSelected: {
        color: Colors.primary,
        fontWeight: '600',
    },
    todayRecorded: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    recordedEmoji: {
        fontSize: 40,
        marginRight: Spacing.md,
    },
    recordedInfo: {
        flex: 1,
    },
    recordedTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    recordedMemo: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 4,
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
        fontSize: 16,
        marginTop: 2,
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
        marginBottom: Spacing.lg,
    },
    memoInput: {
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        height: 100,
        textAlignVertical: 'top',
        fontSize: FontSize.md,
        color: Colors.text,
        marginTop: Spacing.lg,
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
        padding: Spacing.md,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    listDate: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        width: 100,
    },
    listContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    listEmoji: {
        fontSize: 24,
        marginRight: Spacing.md,
    },
    listMemo: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    emptyList: {
        textAlign: 'center',
        color: Colors.textTertiary,
        marginTop: Spacing.xl,
    },
});
