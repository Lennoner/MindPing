import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// AsyncStorage 키
const SCHEDULE_DATE_KEY = 'mindping_last_schedule_date';

/**
 * 오늘 날짜 문자열 반환 (YYYY-MM-DD)
 */
function getTodayDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

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
 * 
 * 핵심: 하루에 단 한 번만 스케줄링을 수행함 (AsyncStorage 기반 락)
 * 스토어(hasTodayMessage)를 진실의 원천으로 사용
 */
export async function ensureMessageSchedule(userTimeSlots: string[], immediateFirst: boolean = false) {
    if (userTimeSlots.length === 0) return;

    const messageStore = useMessageStore.getState();
    const todayStr = getTodayDateString();

    // ─── 1단계: 오늘 메시지가 스토어에 이미 있는지 확인 ───
    // 스토어에 오늘 메시지가 있으면 = 오늘 할 일은 끝난 것
    const hasTodayInStore = messageStore.hasTodayMessage();

    if (hasTodayInStore) {
        // 오늘 메시지가 이미 존재 → 오늘 메시지 생성은 건너뜀
        // 미래 스케줄링만 보장하면 됨 (하루 1회 제한 적용)
        const lastScheduleDate = await AsyncStorage.getItem(SCHEDULE_DATE_KEY);
        if (lastScheduleDate === todayStr) {
            // 이미 오늘 스케줄링 완료 → 완전 스킵
            console.log('[Notifications] 오늘 이미 스케줄링 완료. 스킵합니다.');
            return;
        }
    }

    try {
        // ─── 2단계: 오늘 메시지가 없다면 생성 ───
        if (!hasTodayInStore) {
            // 스케줄에서 오늘 예약된 알림이 있는지 확인
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
            const today = new Date();
            const todayDateStr = today.toDateString();

            const todaySchedule = scheduledNotifications.find(n => {
                const trigger = n.trigger as any;
                if (!trigger?.date) return false;
                const triggerDate = new Date(trigger.date);
                return !isNaN(triggerDate.getTime()) && triggerDate.toDateString() === todayDateStr;
            });

            if (todaySchedule) {
                // A. 스케줄에 있으면 → 그 메시지를 스토어로 가져옴 (Sync)
                const data = todaySchedule.content.data as { messageId?: string };
                const msgObj = SAMPLE_MESSAGES.find(m => m.id === data?.messageId);
                const triggerDate = new Date((todaySchedule.trigger as any).date);

                if (msgObj) {
                    messageStore.addMessage({
                        id: msgObj.id,
                        content: msgObj.content,
                        category: msgObj.type,
                        receivedAt: triggerDate,
                        isRead: false,
                    });
                    useUserStore.getState().setLastMessage(msgObj.id, msgObj.type);
                }
            } else {
                // B. 스토어에도 없고 스케줄에도 없음 → 즉시 생성
                const triggerDate = new Date();
                triggerDate.setMinutes(triggerDate.getMinutes() - 1);

                const scheduledIds = (await Notifications.getAllScheduledNotificationsAsync())
                    .map(n => (n.content.data as any)?.messageId)
                    .filter((id: string) => !!id);

                const selected = selectRandomMessage(scheduledIds);

                messageStore.addMessage({
                    id: selected.id,
                    content: selected.content,
                    category: selected.type,
                    receivedAt: triggerDate,
                    isRead: false,
                });
                useUserStore.getState().setLastMessage(selected.id, selected.type);
            }
        }

        // ─── 3단계: 미래 스케줄링 보장 (내일부터 +7일) ───
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        // 중복 알림 정리 (동일 날짜에 여러 개가 예약된 경우)
        const notifsByDate: Record<string, string[]> = {};
        for (const n of scheduledNotifications) {
            const trigger = n.trigger as any;
            if (!trigger?.date) continue;
            const d = new Date(trigger.date);
            if (isNaN(d.getTime())) continue;
            const dateStr = d.toDateString();
            if (!notifsByDate[dateStr]) {
                notifsByDate[dateStr] = [];
            }
            notifsByDate[dateStr].push(n.identifier);
        }

        // 중복된 알림 취소 (각 날짜에 1개만 유지)
        for (const [dateStr, ids] of Object.entries(notifsByDate)) {
            if (ids.length > 1) {
                console.log(`[Notifications] ${dateStr}에 ${ids.length}개의 중복 알림 발견, 정리 중...`);
                for (let i = 1; i < ids.length; i++) {
                    await Notifications.cancelScheduledNotificationAsync(ids[i]);
                }
            }
        }

        // 기존 스케줄된 날짜들 파악
        const scheduledDates = new Set(Object.keys(notifsByDate));

        // 이미 예약된 메시지 ID들 (중복 방지)
        const scheduledIds = scheduledNotifications
            .map(n => (n.content.data as any)?.messageId)
            .filter((id: string) => !!id);

        const today = new Date();
        for (let i = 1; i <= 7; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);
            const dateStr = targetDate.toDateString();

            if (!scheduledDates.has(dateStr)) {
                const randomSlot = userTimeSlots[Math.floor(Math.random() * userTimeSlots.length)];
                const triggerTime = getRandomTimeInSlot(randomSlot, targetDate);

                const selected = selectRandomMessage(scheduledIds);
                scheduledIds.push(selected.id);

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

        // ─── 4단계: 오늘 스케줄링 완료 기록 ───
        await AsyncStorage.setItem(SCHEDULE_DATE_KEY, todayStr);

    } catch (error) {
        console.error('[Notifications] 스케줄링 중 오류 발생:', error);
    }
}

/**
 * 알림 설정 변경 시 호출 - 미래 스케줄만 재설정 (오늘 메시지 보호)
 */
export async function rescheduleFromTomorrow(userTimeSlots: string[]) {
    try {
        // 기존 예약된 알림 중 오늘 이후 것만 취소
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const today = new Date();
        const todayDateStr = today.toDateString();

        for (const n of scheduledNotifications) {
            const trigger = n.trigger as any;
            if (!trigger?.date) continue;
            const d = new Date(trigger.date);
            if (isNaN(d.getTime())) continue;

            // 오늘 이후(내일~)의 알림만 취소
            if (d.toDateString() !== todayDateStr) {
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
            }
        }

        // 스케줄링 락 리셋하여 미래 스케줄 재생성 허용
        await AsyncStorage.removeItem(SCHEDULE_DATE_KEY);

        // 미래 스케줄 재생성
        if (userTimeSlots.length > 0) {
            await ensureMessageSchedule(userTimeSlots);
        }
    } catch (error) {
        console.error('[Notifications] 재스케줄링 중 오류 발생:', error);
    }
}

// 기존 함수 호환성 유지 (Onboarding 등에서 호출)
export async function scheduleRandomDailyMessage(userTimeSlots: string[], immediate: boolean = false) {
    return ensureMessageSchedule(userTimeSlots, immediate);
}
