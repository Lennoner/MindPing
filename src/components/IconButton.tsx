import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface IconButtonProps {
    icon: IoniconsName;
    size?: number;
    color?: string;
    onPress: () => void;
    selected?: boolean;
}

/**
 * Ionicons 기반 아이콘 버튼 컴포넌트
 * React Native Paper의 IconButton 대체
 */
export function IconButton({
    icon,
    size = 24,
    color,
    onPress,
    selected = false
}: IconButtonProps) {
    const iconColor = color || (selected ? Colors.primary : Colors.textTertiary);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name={icon} size={size} color={iconColor} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
