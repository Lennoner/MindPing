/**
 * 날짜 포맷팅 유틸리티 함수들
 */

/**
 * Date 객체를 "1월 15일" 형식으로 변환
 */
export function formatDateKorean(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
}

/**
 * Date 객체를 "1월 15일 수요일" 형식으로 변환
 */
export function formatDateWithDay(date: Date): string {
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = dayNames[date.getDay()];
    return `${month}월 ${day}일 ${dayName}`;
}

/**
 * ISO 날짜 문자열(YYYY-MM-DD)을 "1월 15일" 형식으로 변환
 */
export function formatISODateKorean(dateStr: string): string {
    const [, month, day] = dateStr.split('-');
    return `${parseInt(month)}월 ${parseInt(day)}일`;
}

/**
 * 오늘 날짜를 ISO 형식(YYYY-MM-DD)으로 반환
 */
export function getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * 시간대에 따른 인사말 반환
 */
export function getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '편안한 밤 되세요';
}
