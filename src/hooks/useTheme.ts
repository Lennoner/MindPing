import { useColorScheme } from 'react-native';
import { LightColors, DarkColors } from '../constants/theme';

/**
 * 디바이스의 다크/라이트 모드 설정에 따라 적절한 색상 테마를 반환합니다.
 */
export function useThemeColors() {
    const colorScheme = useColorScheme();
    return colorScheme === 'dark' ? DarkColors : LightColors;
}

/**
 * 현재 다크모드인지 여부를 반환합니다.
 */
export function useIsDarkMode() {
    const colorScheme = useColorScheme();
    return colorScheme === 'dark';
}
