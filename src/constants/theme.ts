// MindPing 테마 색상 - 깔끔하고 모던한 디자인

// 라이트 모드 색상
export const LightColors = {
  // 브랜드 색상
  primary: '#6366F1',      // Indigo/보라
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // 그라데이션
  gradientStart: '#818CF8',
  gradientEnd: '#6366F1',

  // 메시지 카드 그라데이션
  messageCardGradientStart: '#F8F7FF',
  messageCardGradientEnd: '#F0EEFF',

  // 배경
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',

  // 텍스트
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textPrimary: '#6366F1',

  // 상태
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  // 카테고리 색상 (7가지)
  categoryCognitive: '#6366F1',   // 인지/심리 - 인디고
  categoryMindfulness: '#8B5CF6', // 마음챙김 - 바이올렛
  categoryAction: '#F59E0B',      // 실천 - 앰버
  categoryEmotion: '#EC4899',     // 감정 - 핑크
  categoryGrowth: '#10B981',      // 성장 - 에메랄드
  categoryRelationship: '#06B6D4',// 관계 - 시안
  categorySelfcare: '#F472B6',    // 자기돌봄 - 라이트핑크
  categoryDefault: '#9CA3AF',

  // 기타
  border: '#F3F4F6',
  cardBorder: '#E8E8F0',
  white: '#FFFFFF',

  // 미션 배너
  missionBg: '#6366F1',
  missionCompleted: '#22C55E',
};

// 다크 모드 색상
export const DarkColors = {
  // 브랜드 색상 (동일)
  primary: '#818CF8',      // 다크모드에서 더 밝게
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',

  // 그라데이션
  gradientStart: '#818CF8',
  gradientEnd: '#6366F1',

  // 메시지 카드 그라데이션 (다크버전)
  messageCardGradientStart: '#1F2937',
  messageCardGradientEnd: '#111827',

  // 배경
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  surface: '#1E293B',
  surfaceVariant: '#334155',

  // 텍스트
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textPrimary: '#A5B4FC',

  // 상태
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',

  // 카테고리 색상 (7가지)
  categoryCognitive: '#818CF8',   // 인지/심리
  categoryMindfulness: '#A78BFA', // 마음챙김
  categoryAction: '#FBBF24',      // 실천
  categoryEmotion: '#F472B6',     // 감정
  categoryGrowth: '#34D399',      // 성장
  categoryRelationship: '#22D3EE',// 관계
  categorySelfcare: '#F9A8D4',    // 자기돌봄
  categoryDefault: '#9CA3AF',

  // 기타
  border: '#334155',
  cardBorder: '#475569',
  white: '#FFFFFF',

  // 미션 배너
  missionBg: '#6366F1',
  missionCompleted: '#22C55E',
};

// 기본 Colors는 라이트 모드 (기존 코드 호환성 유지)
export const Colors = LightColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,     // 수정: xl 사이즈 조정
  xxl: 24,    // 수정: xxl 사이즈 조정
  title: 28,  // 추가: 타이틀용 큰 폰트
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// 표준화된 그림자 시스템
export const Elevation = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
};
