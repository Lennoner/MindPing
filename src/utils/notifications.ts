import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { SAMPLE_MESSAGES, MessageData } from '../constants/data';
import { useUserStore } from '../stores/userStore';

// 알림 핸들러 설정 (앱 실행 중에도 알림 표시)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// 알림 권한 요청 및 토큰 가져오기 (로컬 알림만 쓸 거면 토큰은 선택적)
export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        // 에뮬레이터에서도 로컬 알림은 뜸 (Expo Go)
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
    }

    return true;
}

// 랜덤 메시지 발송 스케줄링
export async function scheduleRandomDailyMessage(userTimeSlots: string[]) {
    // 기존 예약된 알림 취소 (중복 방지)
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (userTimeSlots.length === 0) {
        console.log('No time slots selected');
        return;
    }

    // 1. 메시지 스마트 선택 (MVP 로직)
    const store = useUserStore.getState();
    const { lastMessageId, lastMessageType } = store;

    let candidateMessages = SAMPLE_MESSAGES;

    // 필터 1: 직전 메시지와 중복 방지 (간단한 버전)
    if (lastMessageId) {
        candidateMessages = candidateMessages.filter(msg => msg.id !== lastMessageId);
    }

    // 필터 2: 질문형 연속 방지
    if (lastMessageType === 'question') {
        const nonQuestionMessages = candidateMessages.filter(msg => msg.type !== 'question');
        // 혹시 필터링 후 남은 게 없으면(그럴 리 없지만) 전체 풀 사용
        if (nonQuestionMessages.length > 0) {
            candidateMessages = nonQuestionMessages;
        }
    }

    // 랜덤 선택
    const randomMessage = candidateMessages[Math.floor(Math.random() * candidateMessages.length)];

    // 선택된 메시지 정보 저장 (다음 발송 시 활용)
    // 주의: 실제 발송 시점이 아니라 '예약' 시점에 저장되므로 오차가 있을 수 있음
    store.setLastMessage(randomMessage.id, randomMessage.type);

    // 2. 시간대 랜덤 선택 및 구체적 시간 생성
    // 예: 'morning' (06-09) -> 07:30
    const randomSlot = userTimeSlots[Math.floor(Math.random() * userTimeSlots.length)];
    const date = getNextTriggerDate(randomSlot);

    console.log(`Scheduling notification for: ${date.toLocaleString()} with message: ${randomMessage.content}`);

    // 3. 알림 예약 (메시지 미리보기: 50자로 제한)
    const previewLength = 50;
    const messagePreview = randomMessage.content.length > previewLength
        ? randomMessage.content.slice(0, previewLength) + '...'
        : randomMessage.content;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "마음알림",
            subtitle: "오늘의 메시지가 도착했어요 💜",
            body: messagePreview,
            data: { messageId: randomMessage.id },
        },
        trigger: {
            date: date, // 구체적인 Date 객체 사용
            type: Notifications.SchedulableTriggerInputTypes.DATE, // 명시적 타입 지정 (가독성)
        },
    });

    return date;
}

// 시간대 문자열을 받아 다음 알림 시간을 계산하는 함수
function getNextTriggerDate(slot: string): Date {
    const now = new Date();
    const target = new Date();

    // 시간대별 범위 정의
    let startHour = 8; // 기본값
    let endHour = 22;

    switch (slot) {
        case 'morning': // 06-09
            startHour = 6; endHour = 9; break;
        case 'forenoon':  // 09-12
            startHour = 9; endHour = 12; break;
        case 'afternoon': // 12-18
            startHour = 12; endHour = 18; break;
        case 'evening': // 18-22
            startHour = 18; endHour = 22; break;
        case 'night':   // 22-00
            startHour = 22; endHour = 24; break;
    }

    // 범위 내 랜덤 시간 생성 (분 단위)
    const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
    const randomMinute = Math.floor(Math.random() * 60);

    target.setHours(randomHour, randomMinute, 0, 0);

    // 만약 생성된 시간이 현재보다 과거라면, 내일로 설정
    // 단, 'night' 슬롯(22-24)의 경우 자정을 넘어가면 날짜 처리가 복잡해지므로 단순화 (당일 밤 or 내일 밤)
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }

    return target;
}
