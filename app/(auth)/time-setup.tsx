import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../src/stores/userStore';
import { scheduleRandomDailyMessage } from '../../src/utils/notifications';
import { Colors, FontSize, Spacing, BorderRadius, TimeSlot } from '../../src/constants';
import { TIME_SLOTS } from '../../src/constants/data';

export default function TimeSetupScreen() {
    const router = useRouter();
    const { preferredTimeSlots, setPreferredTimeSlots: setTimeSlots } = useUserStore();
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(preferredTimeSlots);

    const handleSlotToggle = (slot: TimeSlot) => {
        setSelectedSlots(prev =>
            prev.includes(slot)
                ? prev.filter(s => s !== slot)
                : [...prev, slot]
        );
    };

    const onNext = async () => {
        if (selectedSlots.length === 0) {
            return; // TODO: 에러 표시
        }

        setTimeSlots(selectedSlots);

        // 알림 스케줄링 실행
        await scheduleRandomDailyMessage(selectedSlots);

        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>메시지 시간대 설정</Text>
                <Text style={styles.subtitle}>
                    언제 위로 메시지를 받고 싶으신가요?{'\n'}
                    선택한 시간대 중 랜덤하게 발송됩니다.
                </Text>
            </View>

            <View style={styles.slotsContainer}>
                {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.id);
                    return (
                        <TouchableOpacity
                            key={slot.id}
                            style={[
                                styles.slotCard,
                                isSelected && styles.slotCardSelected
                            ]}
                            onPress={() => handleSlotToggle(slot.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.slotInfo}>
                                <Text style={[
                                    styles.slotLabel,
                                    isSelected && styles.slotLabelSelected
                                ]}>
                                    {slot.label}
                                </Text>
                                <Text style={[
                                    styles.slotRange,
                                    isSelected && styles.slotRangeSelected
                                ]}>
                                    {slot.range}
                                </Text>
                            </View>
                            <View style={[
                                styles.checkbox,
                                isSelected && styles.checkboxSelected
                            ]}>
                                {isSelected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoEmoji}>💡</Text>
                <Text style={styles.infoText}>
                    여러 시간대를 선택하면 더 예측 불가능한 순간에 메시지가 도착해요!
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={onNext}
                    disabled={selectedSlots.length === 0}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                >
                    완료! 시작하기
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.lg,
        paddingTop: Spacing.xxl,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    slotsContainer: {
        gap: Spacing.md,
    },
    slotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    slotCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: 'rgba(99, 102, 241, 0.08)', // primary light bg
    },
    slotInfo: {
        flex: 1,
    },
    slotLabel: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    slotLabelSelected: {
        color: Colors.primary,
    },
    slotRange: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    slotRangeSelected: {
        color: Colors.primaryDark,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(129, 140, 248, 0.15)', // primaryLight bg
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginTop: Spacing.xl,
        gap: Spacing.sm,
    },
    infoEmoji: {
        fontSize: 20,
    },
    infoText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.primaryDark,
        lineHeight: 20,
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: Spacing.lg,
    },
    button: {
        borderRadius: BorderRadius.md,
    },
    buttonContent: {
        height: 56,
    },
    buttonLabel: {
        fontSize: FontSize.md,
        fontWeight: '600',
    },
});
