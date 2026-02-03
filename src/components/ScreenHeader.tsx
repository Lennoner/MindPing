import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors, Spacing, FontSize } from '../constants';

interface ScreenHeaderProps {
    title: string | React.ReactNode;
    rightAction?: React.ReactNode;
}

/**
 * 통일된 화면 헤더 컴포넌트
 * - 고정 높이 56px
 * - 타이틀만 표시 (소제목 제거로 일관성 확보)
 * - 우측 액션 영역
 */
export function ScreenHeader({
    title,
    rightAction,
}: ScreenHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                {typeof title === 'string' ? (
                    <Text style={styles.title}>{title}</Text>
                ) : (
                    title
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
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.background,
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
