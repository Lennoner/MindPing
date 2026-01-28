import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { useUserStore } from '../../src/stores/userStore';

export default function SettingsScreen() {
    const router = useRouter();
    const { user, logout, isTrialActive, subscriptionPlan } = useUserStore();

    const menuItems = [
        { icon: '⏰', label: '시간대 설정', path: '/notification-settings' },
        { icon: '🔔', label: '알림 설정', path: '/notification-settings' },
        { icon: '💎', label: '구독 관리', path: '/subscription' },
        { icon: '🛡️', label: '개인정보 처리방침', path: null },
    ];

    const handleMenuPress = (path: string | null) => {
        if (path) {
            router.push(path as any);
        }
    };

    const handleLogout = () => {
        logout();
        router.replace('/onboarding');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>설정</Text>
            </View>

            <View style={styles.content}>
                {/* 프로필 카드 */}
                <View style={styles.profileCard}>
                    <View style={styles.profileIcon}>
                        <Text style={styles.profileIconText}>{user?.nickname?.charAt(0) || '사'}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.nickname || '사용자'}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {isTrialActive ? 'TRIAL' : subscriptionPlan === 'free' ? 'FREE' : 'MEMBER'}
                            </Text>
                        </View>
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
                            onPress={() => handleMenuPress(item.path)}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIconBox}>
                                    <Text style={styles.menuIcon}>{item.icon}</Text>
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 로그아웃 버튼 */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>↪  로그아웃</Text>
                </TouchableOpacity>

                <Text style={styles.version}>MindPing v2.0</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
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
    badge: {
        backgroundColor: '#FFD700', // Gold color for MEMBER badge
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.text,
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
    menuIcon: {
        fontSize: 14,
        color: Colors.primary,
    },
    menuLabel: {
        fontSize: FontSize.md,
        color: Colors.text,
        fontWeight: '500',
    },
    chevron: {
        fontSize: 18,
        color: Colors.textTertiary,
        fontWeight: '300',
    },
    logoutBtn: {
        backgroundColor: '#FFF0F0',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoutText: {
        color: Colors.error,
        fontWeight: '600',
        fontSize: FontSize.md,
    },
    version: {
        textAlign: 'center',
        fontSize: FontSize.xs,
        color: Colors.textTertiary,
    },
});
