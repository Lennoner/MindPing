import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants';
import { useUserStore } from '../../src/stores/userStore';

export default function SettingsScreen() {
    const router = useRouter();
    const { user, resetUser } = useUserStore();

    const menuItems = [
        { icon: '🔔', label: '알림 설정', path: '/notification-settings' },
        { icon: '🛡️', label: '개인정보 처리방침', path: 'https://Lennoner.github.io/MindPing/public/privacy-policy.html', isExternal: true },
    ];

    const handleMenuPress = (item: typeof menuItems[0]) => {
        if (item.isExternal) {
            // 외부 링크는 추후 웹뷰나 브라우저 열기로 처리 가능 (현재는 일단 패스하거나 구현)
            // 여기서는 간단히 router.push로 웹뷰 페이지를 열거나 해야 하지만, 
            // 일단 로컬 파일이므로 별도 처리가 필요할 수 있음. 
            // 편의상 알림 설정 외에는 기능이 없으므로 일단 둠.
            // 실제 구현에서는 Linking.openURL 사용 추천.
            const { Linking } = require('react-native');
            Linking.openURL(item.path);
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
                    onPress: () => {
                        resetUser();
                        router.replace('/onboarding');
                    }
                }
            ]
        );
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
                                    <Text style={styles.menuIcon}>{item.icon}</Text>
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 초기화 버튼 */}
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                    <Text style={styles.resetText}>🗑️ 데이터 초기화</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.version}>MindPing v2.0</Text>
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
