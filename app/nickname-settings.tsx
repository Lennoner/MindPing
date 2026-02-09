import { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants';
import { useUserStore } from '../src/stores/userStore';
import { ScreenHeader } from '../src/components';

export default function NicknameSettingsScreen() {
    const router = useRouter();
    const { user, updateUser } = useUserStore();
    const [nickname, setNickname] = useState(user?.nickname || '');

    const handleSave = () => {
        const trimmedNickname = nickname.trim();

        if (!trimmedNickname) {
            Alert.alert('알림', '닉네임을 입력해주세요.');
            return;
        }

        updateUser({ nickname: trimmedNickname });
        Alert.alert('완료', '닉네임이 변경되었습니다.', [
            { text: '확인', onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader title="닉네임 변경" showBack />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.inputCard}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="person-outline" size={40} color={Colors.primary} />
                    </View>

                    <Text style={styles.label}>새로운 닉네임</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="닉네임 입력"
                        value={nickname}
                        onChangeText={setNickname}
                        placeholderTextColor={Colors.textTertiary}
                        maxLength={10}
                        autoFocus
                    />

                    <Text style={styles.hint}>최대 10자까지 입력 가능해요</Text>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                    contentStyle={styles.saveButtonContent}
                    labelStyle={styles.saveButtonLabel}
                >
                    저장
                </Button>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    inputCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.xl,

        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    input: {
        width: '100%',
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        fontSize: FontSize.xl,
        textAlign: 'center',
        paddingVertical: Spacing.sm,
        color: Colors.text,
    },
    hint: {
        marginTop: Spacing.sm,
        fontSize: FontSize.sm,
        color: Colors.textTertiary,
    },
    saveButton: {
        borderRadius: BorderRadius.md,
    },
    saveButtonContent: {
        height: 56,
    },
    saveButtonLabel: {
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
});
