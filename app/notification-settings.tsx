import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants';
import { TIME_SLOTS, TimeSlot } from '../src/constants/data';
import { useUserStore } from '../src/stores/userStore';
import { scheduleRandomDailyMessage } from '../src/utils/notifications';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const { preferredTimeSlots, setPreferredTimeSlots, notificationsEnabled, setNotificationsEnabled } = useUserStore();
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(preferredTimeSlots);
    const [isEnabled, setIsEnabled] = useState(notificationsEnabled);

    const handleSlotToggle = (slotId: TimeSlot) => {
        setSelectedSlots(prev =>
            prev.includes(slotId)
                ? prev.filter(s => s !== slotId)
                : [...prev, slotId]
        );
    };

    const handleSave = async () => {
        setNotificationsEnabled(isEnabled);
        setPreferredTimeSlots(selectedSlots);

        if (isEnabled && selectedSlots.length > 0) {
            await scheduleRandomDailyMessage(selectedSlots);
        }

        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>← 뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>알림 설정</Text>
                <View style={{ width: 50 }} />
            </View>

            <View style={styles.content}>
                {/* 알림 on/off */}
                <View style={styles.settingRow}>
                    <View>
                        <Text style={styles.settingLabel}>알림 받기</Text>
                        <Text style={styles.settingDesc}>매일 위로 메시지를 받습니다</Text>
                    </View>
                    <Switch
                        value={isEnabled}
                        onValueChange={setIsEnabled}
                        trackColor={{ false: '#E0E0E0', true: Colors.primaryLight }}
                        thumbColor={isEnabled ? Colors.primary : '#f4f3f4'}
                    />
                </View>

                {/* 시간대 선택 */}
                {isEnabled && (
                    <View style={styles.timeSection}>
                        <Text style={styles.sectionTitle}>알림 받을 시간대</Text>
                        <Text style={styles.sectionDesc}>선택한 시간대 중 랜덤한 시간에 메시지가 도착합니다</Text>

                        <View style={styles.slotContainer}>
                            {TIME_SLOTS.map((slot) => (
                                <TouchableOpacity
                                    key={slot.id}
                                    style={[
                                        styles.slotItem,
                                        selectedSlots.includes(slot.id) && styles.slotItemSelected
                                    ]}
                                    onPress={() => handleSlotToggle(slot.id)}
                                >
                                    <Text style={[
                                        styles.slotLabel,
                                        selectedSlots.includes(slot.id) && styles.slotLabelSelected
                                    ]}>
                                        {slot.label}
                                    </Text>
                                    <Text style={[
                                        styles.slotRange,
                                        selectedSlots.includes(slot.id) && styles.slotRangeSelected
                                    ]}>
                                        {slot.range}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveBtn}
                    contentStyle={styles.saveBtnContent}
                    disabled={isEnabled && selectedSlots.length === 0}
                >
                    저장
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        fontSize: FontSize.md,
        color: Colors.primary,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    content: {
        padding: Spacing.lg,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
    },
    settingLabel: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
    },
    settingDesc: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    timeSection: {
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    sectionDesc: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    slotContainer: {
        gap: Spacing.sm,
    },
    slotItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    slotItemSelected: {
        backgroundColor: Colors.primaryLight + '20',
        borderColor: Colors.primary,
    },
    slotLabel: {
        fontSize: FontSize.md,
        fontWeight: '500',
        color: Colors.text,
    },
    slotLabelSelected: {
        color: Colors.primary,
        fontWeight: '700',
    },
    slotRange: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    slotRangeSelected: {
        color: Colors.primary,
    },
    saveBtn: {
        marginTop: Spacing.lg,
        backgroundColor: Colors.primary,
    },
    saveBtnContent: {
        paddingVertical: Spacing.sm,
    },
});
