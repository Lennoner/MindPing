import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants';

interface ScreenHeaderProps {
    title: string | React.ReactNode;
    rightAction?: React.ReactNode;
    showBack?: boolean;
    onBack?: () => void;
}

/**
 * 통일된 화면 헤더 컴포넌트
 * - 고정 높이 64px
 * - 뒤로가기 버튼 옵션
 * - 타이틀 표시
 * - 우측 액션 영역
 */
export function ScreenHeader({
    title,
    rightAction,
    showBack = false,
    onBack,
}: ScreenHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                {showBack && onBack && (
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Ionicons name="chevron-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                )}
                <View style={styles.titleContainer}>
                    {typeof title === 'string' ? (
                        <Text style={styles.title}>{title}</Text>
                    ) : (
                        title
                    )}
                </View>
            </View>
            {rightAction && (
                <View style={styles.rightAction}>
                    {rightAction}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: 12,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -Spacing.sm,
        marginRight: Spacing.xs,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.text,
    },
    rightAction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
});
