import { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiaryStore } from '../../src/stores';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants';

export default function DiaryScreen() {
    const { entries, addEntry, getEntryByDate } = useDiaryStore();
    const [content, setContent] = useState('');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayEntry = getEntryByDate(todayStr);

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(month)}월 ${parseInt(day)}일`;
    };

    const handleSave = () => {
        if (content.trim()) {
            addEntry(content.trim());
            setContent('');
        }
    };

    // 오늘 이미 기록했으면 수정 모드
    const isEditMode = !!todayEntry;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <Text style={styles.title}>오늘의 기록</Text>
                        <Text style={styles.date}>{formatDate(todayStr)}</Text>
                    </View>

                    {/* 오늘 기록 완료 상태 */}
                    {todayEntry && (
                        <View style={styles.todayCard}>
                            <Text style={styles.todayLabel}>오늘 작성한 기록</Text>
                            <Text style={styles.todayContent}>{todayEntry.content}</Text>
                        </View>
                    )}

                    {/* 입력 영역 */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>
                            {isEditMode ? '다시 작성하기' : '오늘 하루는 어땠나요?'}
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="자유롭게 적어보세요..."
                            value={content}
                            onChangeText={setContent}
                            multiline
                            maxLength={500}
                            placeholderTextColor={Colors.textTertiary}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>{content.length}/500</Text>

                        <Button
                            mode="contained"
                            onPress={handleSave}
                            disabled={!content.trim()}
                            style={styles.saveBtn}
                            contentStyle={styles.saveBtnContent}
                        >
                            {isEditMode ? '수정하기' : '저장하기'}
                        </Button>
                    </View>

                    {/* 이전 기록들 */}
                    {entries.length > 0 && (
                        <View style={styles.historySection}>
                            <Text style={styles.historyTitle}>지난 기록</Text>
                            {[...entries]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .filter(e => e.date !== todayStr)
                                .slice(0, 10)
                                .map((entry) => (
                                    <View key={entry.id} style={styles.historyItem}>
                                        <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                                        <Text style={styles.historyContent} numberOfLines={2}>
                                            {entry.content}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: Spacing.lg,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    date: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    todayCard: {
        backgroundColor: Colors.primaryLight + '20',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    todayLabel: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    todayContent: {
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 22,
    },
    inputSection: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    inputLabel: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    textInput: {
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        minHeight: 120,
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 22,
    },
    charCount: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
    saveBtn: {
        marginTop: Spacing.md,
        backgroundColor: Colors.primary,
    },
    saveBtnContent: {
        paddingVertical: Spacing.xs,
    },
    historySection: {
        marginTop: Spacing.md,
    },
    historyTitle: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    historyItem: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    historyDate: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    historyContent: {
        fontSize: FontSize.md,
        color: Colors.text,
        lineHeight: 20,
    },
});
