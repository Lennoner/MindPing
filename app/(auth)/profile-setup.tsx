import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../src/stores';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants';

const CONCERNS = [
    '번아웃', '불안', '우울', '외로움', '수면 문제',
    '자존감', '인간관계', '업무 스트레스', '미래 불안', '기타'
];

const AGE_GROUPS = ['20대 초반', '20대 후반', '30대 초반', '30대 후반', '40대 이상'];

export default function ProfileSetupScreen() {
    const router = useRouter();
    const { setUser, startTrial } = useUserStore();

    const [nickname, setNickname] = useState('');
    const [selectedAge, setSelectedAge] = useState<string | null>(null);
    const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

    const handleConcernToggle = (concern: string) => {
        setSelectedConcerns(prev =>
            prev.includes(concern)
                ? prev.filter(c => c !== concern)
                : [...prev, concern]
        );
    };

    const handleNext = () => {
        if (nickname.trim().length < 2) {
            return; // TODO: 에러 표시
        }

        setUser({
            id: Date.now().toString(),
            nickname: nickname.trim(),
            ageGroup: selectedAge || undefined,
            concerns: selectedConcerns.length > 0 ? selectedConcerns : undefined,
            createdAt: new Date(),
        });

        startTrial();
        router.push('/(auth)/time-setup');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>프로필 설정</Text>
                <Text style={styles.subtitle}>당신을 어떻게 불러드릴까요?</Text>
            </View>

            {/* 닉네임 입력 */}
            <View style={styles.section}>
                <Text style={styles.label}>닉네임 *</Text>
                <TextInput
                    mode="outlined"
                    placeholder="2자 이상 입력해주세요"
                    value={nickname}
                    onChangeText={setNickname}
                    maxLength={10}
                    outlineColor={Colors.border}
                    activeOutlineColor={Colors.primary}
                    style={styles.input}
                />
            </View>

            {/* 나이대 선택 */}
            <View style={styles.section}>
                <Text style={styles.label}>나이대 (선택)</Text>
                <View style={styles.chipContainer}>
                    {AGE_GROUPS.map((age) => (
                        <Chip
                            key={age}
                            selected={selectedAge === age}
                            onPress={() => setSelectedAge(selectedAge === age ? null : age)}
                            style={[
                                styles.chip,
                                selectedAge === age && styles.chipSelected
                            ]}
                            textStyle={[
                                styles.chipText,
                                selectedAge === age && styles.chipTextSelected
                            ]}
                        >
                            {age}
                        </Chip>
                    ))}
                </View>
            </View>

            {/* 고민 선택 */}
            <View style={styles.section}>
                <Text style={styles.label}>주요 고민 (선택, 복수 선택 가능)</Text>
                <View style={styles.chipContainer}>
                    {CONCERNS.map((concern) => (
                        <Chip
                            key={concern}
                            selected={selectedConcerns.includes(concern)}
                            onPress={() => handleConcernToggle(concern)}
                            style={[
                                styles.chip,
                                selectedConcerns.includes(concern) && styles.chipSelected
                            ]}
                            textStyle={[
                                styles.chipText,
                                selectedConcerns.includes(concern) && styles.chipTextSelected
                            ]}
                        >
                            {concern}
                        </Chip>
                    ))}
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={handleNext}
                    disabled={nickname.trim().length < 2}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                >
                    다음
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
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
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    input: {
        backgroundColor: Colors.surface,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        backgroundColor: Colors.surfaceVariant,
        borderRadius: BorderRadius.full,
    },
    chipSelected: {
        backgroundColor: Colors.primary,
    },
    chipText: {
        color: Colors.text,
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    buttonContainer: {
        marginTop: Spacing.xl,
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
