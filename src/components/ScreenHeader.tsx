import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors, Spacing, FontSize } from '../constants';

interface ScreenHeaderProps {
    title: string | React.ReactNode;
    subtitle?: string;
    rightAction?: React.ReactNode;
    showBorder?: boolean;
}

/**
 * 통일된 화면 헤더 컴포넌트
 * 일기, 보관함, 설정 등 화면에서 사용
 */
export function ScreenHeader({
    title,
    subtitle,
    rightAction,
    showBorder = false
}: ScreenHeaderProps) {
    return (
        <View style={[styles.container, showBorder && styles.withBorder]}>
            <View style={styles.textContainer}>
                {typeof title === 'string' ? (
                    <Text style={styles.title}>{title}</Text>
                ) : (
                    title
                )}
                {subtitle && (
                    <Text style={styles.subtitle}>{subtitle}</Text>
                )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    withBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: FontSize.xl, // 20 or 24
        fontWeight: '700',
        color: Colors.text,
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    rightAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
