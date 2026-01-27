import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { SAMPLE_MESSAGES } from '../../src/constants/data';

export default function ArchiveScreen() {
    const archiveMessages = [
        { ...SAMPLE_MESSAGES[0], date: '1월 26일', isToday: true },
        { ...SAMPLE_MESSAGES[1], date: '1월 25일', isToday: false },
        { ...SAMPLE_MESSAGES[2], date: '1월 24일', isToday: false },
        { ...SAMPLE_MESSAGES[3], date: '1월 23일', isToday: false },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>보관함</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {archiveMessages.map((message, index) => (
                    <View key={index} style={styles.cardContainer}>
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

                            <Text style={styles.content}>{message.content}</Text>
                        </View>
                    </View>
                ))}
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function getLineColor(index: number) {
    const colors = ['#6366F1', '#F59E0B', '#6366F1', '#FF5252'];
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
    scrollView: {
        flex: 1,
        padding: Spacing.lg,
    },
    cardContainer: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
        height: 160,
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
        borderLeftWidth: 0, // 왼쪽 선과 겹치지 않게
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
