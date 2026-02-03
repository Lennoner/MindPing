import { View, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { useUserStore } from '../../src/stores/userStore';
import { useMessageStore } from '../../src/stores/messageStore';
import { useDiaryStore } from '../../src/stores/diaryStore';
import { ScreenHeader } from '../../src/components';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
    const router = useRouter();
    const { user, resetUser } = useUserStore();
    const { resetDiary } = useDiaryStore();
    const { resetMessages } = useMessageStore();

    const menuItems = [
        { iconName: 'notifications-outline' as const, label: '알림 설정', path: '/notification-settings' },
        { iconName: 'shield-outline' as const, label: '개인정보 처리방침', path: 'https://Lennoner.github.io/MindPing/public/privacy-policy.html', isExternal: true },
    ];

    const handleMenuPress = (item: typeof menuItems[0]) => {
        if (item.isExternal) {
            Linking.openURL(item.path!);
        } else if (item.path) {
            router.push(item.path as any);
        }
    };

    const handleReset = () => {
        Alert.alert(
            "데이터 초기화",
            "모든 기록이 삭제되고 처음 상태로 돌아갑니다. 계속하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "초기화",
                    style: "destructive",
                    onPress: async () => {
                        // 모든 스토어 초기화
                        resetUser();
                        resetDiary();
                        resetMessages();
                        // 예약된 알림 취소 (추가된 로직)
                        await Notifications.cancelAllScheduledNotificationsAsync();
                        router.replace('/onboarding');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 통일된 헤더 */}
            <ScreenHeader title="설정" />

            <View style={styles.content}>
                {/* 프로필 카드 */}
                <View style={styles.profileCard}>
                    <View style={styles.profileIcon}>
                        <Text style={styles.profileIconText}>{user?.nickname?.charAt(0) || '나'}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.nickname || '사용자'}</Text>
                        <Text style={styles.profileDesc}>오늘도 평온한 하루 되세요 🌿</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>설정</Text>

                {/* 메뉴 리스트 */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                index !== menuItems.length - 1 && styles.menuItemBorder
                            ]}
                            onPress={() => handleMenuPress(item)}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIconBox}>
                                    <Ionicons name={item.iconName} size={20} color={Colors.textSecondary} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 초기화 버튼 */}
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                    <Ionicons name="trash-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                    <Text style={styles.resetText}>데이터 초기화</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.version}>MindPing v1.0.0</Text>
                    <Text style={styles.copyright}>Simple & Private Healing App</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        padding: Spacing.lg,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        marginBottom: Spacing.xl,

        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    profileIcon: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    profileIconText: {
        fontSize: 24,
        color: Colors.white,
        fontWeight: '600',
    },
    profileInfo: {
        justifyContent: 'center',
    },
    profileName: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    profileDesc: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    menuContainer: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        marginBottom: Spacing.xl,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        backgroundColor: Colors.white,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    menuLabel: {
        fontSize: FontSize.md,
        color: Colors.text,
        fontWeight: '500',
    },
    resetBtn: {
        backgroundColor: '#FFF0F0',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    resetText: {
        color: Colors.error,
        fontWeight: '600',
        fontSize: FontSize.md,
    },
    footer: {
        alignItems: 'center',
    },
    version: {
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
        marginBottom: 4,
    },
    copyright: {
        fontSize: 10,
        color: Colors.textTertiary,
        opacity: 0.7,
    },
});
