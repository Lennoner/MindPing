import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants';
import { useUserStore } from '../src/stores/userStore';

// 요금제 정의
const PLANS = [
    {
        id: 'monthly',
        name: '월간 구독',
        price: '9,900원',
        period: '/월',
        description: '기본 플랜',
        features: ['매일 위로 메시지', '시간대 설정', '감정 일기'],
    },
    {
        id: 'yearly',
        name: '연간 구독',
        price: '99,000원',
        period: '/년',
        description: '17% 할인',
        badge: '추천',
        features: ['매일 위로 메시지', '시간대 설정', '감정 일기', '연간 결제 할인'],
    },
    {
        id: 'student',
        name: '학생 할인',
        price: '6,900원',
        period: '/월',
        description: '대학 이메일 인증',
        features: ['매일 위로 메시지', '시간대 설정', '감정 일기'],
    },
];

export default function SubscriptionScreen() {
    const router = useRouter();
    const { subscriptionPlan, isTrialActive, subscriptionEndDate, startTrial } = useUserStore();

    const handleStartTrial = () => {
        startTrial();
        router.back();
    };

    const handleSelectPlan = (planId: string) => {
        // TODO: 실제 결제 연동 (포트원)
        // 현재는 데모용으로 알림만 표시
        alert(`${planId} 플랜 선택됨\n실제 결제 기능은 추후 연동됩니다.`);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>← 뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>구독 관리</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* 현재 구독 상태 */}
                <View style={styles.statusCard}>
                    <Text style={styles.statusLabel}>현재 구독 상태</Text>
                    <Text style={styles.statusValue}>
                        {isTrialActive ? '무료 체험 중' : subscriptionPlan === 'free' ? '무료' : subscriptionPlan}
                    </Text>
                    {subscriptionEndDate && (
                        <Text style={styles.statusDate}>
                            {isTrialActive ? '체험 종료일' : '다음 결제일'}: {formatDate(subscriptionEndDate)}
                        </Text>
                    )}
                </View>

                {/* 무료 체험 배너 */}
                {!isTrialActive && subscriptionPlan === 'free' && (
                    <TouchableOpacity style={styles.trialBanner} onPress={handleStartTrial}>
                        <View>
                            <Text style={styles.trialTitle}>🎉 7일 무료 체험</Text>
                            <Text style={styles.trialDesc}>카드 등록 없이 바로 시작하세요</Text>
                        </View>
                        <Text style={styles.trialBtn}>시작하기 →</Text>
                    </TouchableOpacity>
                )}

                {/* 요금제 목록 */}
                <Text style={styles.sectionTitle}>요금제 선택</Text>

                {PLANS.map((plan) => (
                    <TouchableOpacity
                        key={plan.id}
                        style={[
                            styles.planCard,
                            plan.badge && styles.planCardRecommended
                        ]}
                        onPress={() => handleSelectPlan(plan.id)}
                    >
                        {plan.badge && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{plan.badge}</Text>
                            </View>
                        )}
                        <View style={styles.planHeader}>
                            <Text style={styles.planName}>{plan.name}</Text>
                            <View style={styles.planPriceRow}>
                                <Text style={styles.planPrice}>{plan.price}</Text>
                                <Text style={styles.planPeriod}>{plan.period}</Text>
                            </View>
                        </View>
                        <Text style={styles.planDescription}>{plan.description}</Text>
                        <View style={styles.featureList}>
                            {plan.features.map((feature, idx) => (
                                <Text key={idx} style={styles.featureItem}>✓ {feature}</Text>
                            ))}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* 구독 취소 */}
                {subscriptionPlan !== 'free' && (
                    <TouchableOpacity style={styles.cancelBtn}>
                        <Text style={styles.cancelText}>구독 취소</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    statusCard: {
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
    },
    statusLabel: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    statusValue: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.white,
    },
    statusDate: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginTop: Spacing.sm,
    },
    trialBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    trialTitle: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.text,
    },
    trialDesc: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    trialBtn: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.primary,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    planCard: {
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    planCardRecommended: {
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    badge: {
        position: 'absolute',
        top: -10,
        right: Spacing.md,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    badgeText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: Colors.white,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    planName: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    planPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    planPrice: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    planPeriod: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    planDescription: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    featureList: {
        gap: 4,
    },
    featureItem: {
        fontSize: FontSize.sm,
        color: Colors.text,
    },
    cancelBtn: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: FontSize.md,
        color: Colors.error,
    },
});
