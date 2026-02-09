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

// 전역 스케줄링 락 (중복 실행 방지)
let isSchedulingInProgress = false;
let lastScheduleTimestamp = 0;
const MIN_SCHEDULE_INTERVAL_MS = 5000; // 최소 5초 간격

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
        // 시뮬레이터 처리 등
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
function selectRandomMessage(excludeIds: string[] = []) {
    const userStore = useUserStore.getState();
    const messageStore = useMessageStore.getState();
    const { lastMessageId, lastMessageType } = userStore;
    const receivedIds = messageStore.getReceivedMessageIds();

    const allExcluded = new Set([...receivedIds, ...excludeIds]);

    let candidates = [...SAMPLE_MESSAGES];

    // 1. 제외 대상 필터링 (이미 받음 + 예약됨)
    const fresh = candidates.filter(msg => !allExcluded.has(msg.id));
    if (fresh.length > 0) {
        candidates = fresh;
    } else {
        // 모든 메시지 소진 시 리셋 (받은 메시지 기록만 리셋, 예약된 것은 유지해야 함)
        // 여기서는 간단히 리셋 로직 호출은 생략하고 candidates를 전체로 복구하되 예약된 것만 뺌
        // 실제로는 messageStore.resetReceivedIds()가 필요할 수 있음
        candidates = candidates.filter(msg => !excludeIds.includes(msg.id));
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
    if (candidates.length === 0) return SAMPLE_MESSAGES[0]; // Fallback
    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    return selected;
}

/**
 * 시간대에서 랜덤 시간 생성
 */
function getRandomTimeInSlot(slot: string, baseDate: Date): Date {
    const target = new Date(baseDate);

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

    return target;
}

/**
 * 1주일치 알림 스케줄링 관리
 * - 앱 접속 시 호출됨
 * - 오늘 메시지 확인 및 동기화
 * - 향후 7일치 스케줄링 보장
 */
export async function ensureMessageSchedule(userTimeSlots: string[], immediateFirst: boolean = false) {
    if (userTimeSlots.length === 0) return;

    // 중복 실행 방지: 이미 스케줄링 중이거나 최근에 실행했으면 스킵
    const now = Date.now();
    if (isSchedulingInProgress) {
        console.log('[Notifications] 스케줄링이 이미 진행 중입니다. 스킵합니다.');
        return;
    }
    if (now - lastScheduleTimestamp < MIN_SCHEDULE_INTERVAL_MS) {
        console.log('[Notifications] 최근 스케줄링이 실행되었습니다. 스킵합니다.');
        return;
    }

    // 락 설정
    isSchedulingInProgress = true;
    lastScheduleTimestamp = now;

    try {
        const messageStore = useMessageStore.getState();
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        // 1. [오늘 메시지 처리]
        // 스토어에 오늘 메시지가 있는지 확인
        const hasTodayInStore = messageStore.hasTodayMessage();

        if (!hasTodayInStore) {
            // 스토어엔 없는데 알림 스케줄에는 있는지 확인 (오늘 날짜)
            const today = new Date();
            const todayStr = today.toDateString(); // "Wed Feb 05 2026" 등

            const todaySchedule = scheduledNotifications.find(n => {
                const trigger = n.trigger as any;
                if (!trigger?.dateComponents && !trigger?.date) return false;
                const triggerDate = trigger.date ? new Date(trigger.date) : null;
                return triggerDate && triggerDate.toDateString() === todayStr;
            });

            if (todaySchedule) {
                // A. 스케줄에 있으면 -> 그 메시지를 스토어로 가져옴 (Sync)
                // 도착 시간이 지났거나, 미래거나 상관없이 오늘 할당된 메시지로 등록
                const data = todaySchedule.content.data as { messageId: string };
                const msgObj = SAMPLE_MESSAGES.find(m => m.id === data.messageId);
                const triggerDate = new Date((todaySchedule.trigger as any).date); // 타입 캐스팅 필요

                if (msgObj) {
                    messageStore.addMessage({
                        id: msgObj.id,
                        content: msgObj.content,
                        category: msgObj.type,
                        receivedAt: triggerDate,
                        isRead: false,
                    });
                    // 같은 타입 연속 방지를 위해 마지막 메시지 정보 저장
                    useUserStore.getState().setLastMessage(msgObj.id, msgObj.type);
                }
            } else {
                // B. 스토어에도 없고 스케줄에도 없음 (첫 실행, 혹은 스케줄 고갈 후 오랜만의 접속) -> 즉시 생성
                // immediateFirst가 true면 즉시 도착 처리
                let triggerDate = new Date();

                if (immediateFirst) {
                    // 즉시 도착 (1분 전으로 설정하여 Loading 방지)
                    triggerDate.setMinutes(triggerDate.getMinutes() - 1);
                } else {
                    // 오늘 남은 시간 중 랜덤 (이미 자나가버렸으면? 그냥 지금 + 랜덤 딜레이 or 내일로 미룸?)
                    // 간단히: 현재 시간이 밤 10시 넘었으면 즉시 발송 or 내일 아침?
                    // 사용자 요청: "매일 00시에 시간 결정" -> 그러나 이미 놓친 오늘은 어쩔 수 없음.
                    // 여기서는 "오늘의 메시지"를 보여주는게 중요하므로, 무조건 하나 생성하되
                    // 지금이 밤 늦었으면 즉시 보여주고, 아니면 남은 슬롯 중 랜덤
                    // 복잡함을 피하기 위해, "오늘 처음 켰는데 스케줄이 없다"면 --> 지금 바로 하나 주는게 UX상 좋음 (user request #3)
                    triggerDate.setMinutes(triggerDate.getMinutes() - 1);
                }

                const selected = selectRandomMessage(scheduledNotifications.map(n => (n.content.data as any).messageId));

                messageStore.addMessage({
                    id: selected.id,
                    content: selected.content,
                    category: selected.type,
                    receivedAt: triggerDate,
                    isRead: false,
                });
                // 같은 타입 연속 방지를 위해 마지막 메시지 정보 저장
                useUserStore.getState().setLastMessage(selected.id, selected.type);

                // 알림은 이미 '도착한' 것으로 간주하고 스케줄링은 건너뛰거나, 
                // 만약 immediateFirst가 아니고 '오늘 오후'로 잡고 싶다면 스케줄링 해야 함.
                // 여기서는 "오늘 빠진 것 채우기"는 즉시 발송으로 통일.
            }
        }

        // 2. [미래 스케줄링 보장] (내일부터 +7일)
        // 기존 스케줄된 날짜들 파악
        const scheduledDates = new Set(
            scheduledNotifications.map(n => {
                const d = new Date((n.trigger as any).date);
                return d.toDateString();
            })
        );

        // 이미 예약된 메시지 ID들 (중복 방지)
        const scheduledIds = scheduledNotifications.map(n => (n.content.data as any).messageId);

        const today = new Date();
        // 내일부터 7일 확인
        for (let i = 1; i <= 7; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);
            const dateStr = targetDate.toDateString();

            if (!scheduledDates.has(dateStr)) {
                // 해당 날짜에 스케줄 없으면 생성
                const randomSlot = userTimeSlots[Math.floor(Math.random() * userTimeSlots.length)];
                const triggerTime = getRandomTimeInSlot(randomSlot, targetDate);

                // 메시지 선택 (기존 예약된 것들 제외)
                const selected = selectRandomMessage(scheduledIds);
                scheduledIds.push(selected.id); // 목록에 추가해 다음 루프에서 제외

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: '마음알림',
                        body: selected.content,
                        data: { messageId: selected.id },
                    },
                    trigger: {
                        date: triggerTime,
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                    },
                });

                console.log(`Scheduled for ${dateStr}: ${triggerTime.toLocaleTimeString()}`);
            }
        }
    } catch (error) {
        console.error('[Notifications] 스케줄링 중 오류 발생:', error);
    } finally {
        // 락 해제
        isSchedulingInProgress = false;
    }
}

// 기존 함수 호환성 유지 (Onboarding 등에서 호출)
export async function scheduleRandomDailyMessage(userTimeSlots: string[], immediate: boolean = false) {
    return ensureMessageSchedule(userTimeSlots, immediate);
}
