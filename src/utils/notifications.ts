import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { SAMPLE_MESSAGES } from '../constants/data';
import { useUserStore } from '../stores/userStore';
import { useMessageStore } from '../stores/messageStore';

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

// 알림 권한 요청
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

/**
 * 중복되지 않는 랜덤 메시지 선택
 */
function selectRandomMessage() {
    const userStore = useUserStore.getState();
    const messageStore = useMessageStore.getState();
    const { lastMessageId, lastMessageType } = userStore;
    const receivedIds = messageStore.getReceivedMessageIds();

    let candidates = [...SAMPLE_MESSAGES];

    // 1. 이미 받은 메시지 제외
    const fresh = candidates.filter(msg => !receivedIds.includes(msg.id));
    if (fresh.length > 0) {
        candidates = fresh;
    } else {
        // 모든 메시지 다 봤으면 리셋

        messageStore.resetReceivedIds();
    }

    // 2. 직전 메시지 제외
    if (lastMessageId) {
        const filtered = candidates.filter(msg => msg.id !== lastMessageId);
        if (filtered.length > 0) candidates = filtered;
    }

    // 3. 같은 타입 연속 방지
    if (lastMessageType) {
        const diffType = candidates.filter(msg => msg.type !== lastMessageType);
        if (diffType.length > 0) candidates = diffType;
    }

    // 랜덤 선택
    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    // 다음 발송 시 활용할 정보 저장
    userStore.setLastMessage(selected.id, selected.type);

    return selected;
}

/**
 * 시간대에서 랜덤 시간 생성
 */
function getRandomTimeInSlot(slot: string): Date {
    const now = new Date();
    const target = new Date();

    let startHour = 8, endHour = 22;
    switch (slot) {
        case 'morning': startHour = 6; endHour = 9; break;
        case 'forenoon': startHour = 9; endHour = 12; break;
        case 'afternoon': startHour = 12; endHour = 18; break;
        case 'evening': startHour = 18; endHour = 22; break;
        case 'night': startHour = 22; endHour = 24; break;
    }

    const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
    const randomMinute = Math.floor(Math.random() * 60);
    target.setHours(randomHour, randomMinute, 0, 0);

    // 과거면 내일로
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }

    return target;
}

/**
 * 핵심 함수: 메시지 스케줄링
 * 1. 랜덤 메시지 선택
 * 2. 홈 + 보관함에 저장 (messageStore.addMessage)
 * 3. 알림 예약
 */
export async function scheduleRandomDailyMessage(userTimeSlots: string[], immediate: boolean = false) {
    // 기존 알림 취소 (새로 스케줄링하므로)
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (userTimeSlots.length === 0) {
        return null;
    }

    // 1. 메시지 선택
    const selected = selectRandomMessage();

    // 2. 발송 시간 결정
    let triggerDate: Date;

    if (immediate) {
        // 즉시 발송 모드 (온보딩 직후 등)
        triggerDate = new Date();
    } else {
        // 일반 스케줄링 모드
        const randomSlot = userTimeSlots[Math.floor(Math.random() * userTimeSlots.length)];
        triggerDate = getRandomTimeInSlot(randomSlot);
    }

    // 3. messageStore에 저장 (홈 + 보관함 동시 처리)
    const message = {
        id: selected.id,
        content: selected.content,
        category: selected.type,
        receivedAt: triggerDate,
        isRead: false,
    };

    // 스토어에 추가 (중복 처리 및 오늘 메시지 설정은 스토어 내부에서 처리)
    useMessageStore.getState().addMessage(message);

    // 4. 알림 예약 (즉시 발송인 경우 알림을 띄우지 않고, 그냥 '받은 상태'로 만듦. 
    //    필요하다면 즉시 알림을 띄울 수도 있지만, 보통 온보딩 직후엔 화면에 바로 보여주는 게 목적)

    if (!immediate) {
        // 미래 시간에 알림 예약
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '마음알림',
                body: selected.content,
                data: { messageId: selected.id },
            },
            trigger: {
                date: triggerDate,
                type: Notifications.SchedulableTriggerInputTypes.DATE,
            },
        });
    }

    return triggerDate;
}
