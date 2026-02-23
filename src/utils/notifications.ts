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
const SCHEDULED_MSGS_KEY = 'mindping_scheduled_messages';

// 글로벌 실행 중 락 (동시 호출 방지)
let isScheduling = false;

/**
 * 예약된 메시지 ID를 날짜별로 AsyncStorage에 저장
 * (알림 발송 후 앱을 열었을 때 동일 메시지를 보여주기 위함)
 */
async function saveScheduledMessage(dateStr: string, messageId: string) {
    try {
        const stored = await AsyncStorage.getItem(SCHEDULED_MSGS_KEY);
        const map: Record<string, string> = stored ? JSON.parse(stored) : {};
        map[dateStr] = messageId;
        // 14일 이전 데이터 정리
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);
        for (const key of Object.keys(map)) {
            if (new Date(key).getTime() < cutoff.getTime()) delete map[key];
        }
        await AsyncStorage.setItem(SCHEDULED_MSGS_KEY, JSON.stringify(map));
    } catch (e) {
        console.error('[Notifications] saveScheduledMessage error:', e);
    }
}

async function getScheduledMessageId(dateStr: string): Promise<string | null> {
    try {
        const stored = await AsyncStorage.getItem(SCHEDULED_MSGS_KEY);
        if (!stored) return null;
        const map: Record<string, string> = JSON.parse(stored);
        return map[dateStr] || null;
    } catch (e) {
        return null;
    }
}

/**
 * 알림 수신/탭 시 메시지를 스토어에 동기화 (_layout.tsx의 리스너에서 호출)
 * 동기화 후 해당 알림의 OS 예약도 취소하여 중복 알림 방지
 */
export async function syncNotificationToStore(messageId: string) {
    const messageStore = useMessageStore.getState();
    if (messageStore.hasTodayMessage()) return; // 이미 오늘 메시지 있음

    const msgObj = SAMPLE_MESSAGES.find(m => m.id === messageId);
    if (!msgObj) return;

    messageStore.addMessage({
        id: msgObj.id,
        content: msgObj.content,
        category: msgObj.type,
        receivedAt: new Date(),
        isRead: false,
    });
    useUserStore.getState().setLastMessage(msgObj.id, msgObj.type);

    // 해당 메시지의 OS 예약 알림을 취소하여 중복 알림 배너 방지
    try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const n of scheduled) {
            const data = n.content.data as { messageId?: string };
            if (data?.messageId === messageId) {
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
                console.log('[Notifications] 동기화 완료, OS 예약 알림 취소:', n.identifier);
            }
        }
    } catch (e) {
        console.error('[Notifications] OS 알림 취소 중 오류:', e);
    }

    console.log('[Notifications] 알림 수신/탭으로 메시지 스토어 동기화 완료:', msgObj.id);
}

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
 * 핵심: 하루에 단 한 번만 스케줄링을 수행함 (AsyncStorage 기반 락 + 실제 스케줄 확인)
 * 스토어(hasTodayMessage)를 진실의 원천으로 사용
 */
export async function ensureMessageSchedule(userTimeSlots: string[]) {
    if (userTimeSlots.length === 0) return;

    // 글로벌 실행 중 락: 이미 스케줄링 중이면 즉시 리턴 (동시 호출 완전 차단)
    if (isScheduling) {
        console.log('[Notifications] 이미 스케줄링 진행 중. 중복 호출 무시.');
        return;
    }
    isScheduling = true;

    const messageStore = useMessageStore.getState();
    const todayStr = getTodayDateString();

    try {
        // ─── 0단계: 오염된 스케줄 정리 (중복 제거) ───
        const currentSchedule = await Notifications.getAllScheduledNotificationsAsync();
        const notifsByDate: Record<string, string[]> = {};

        for (const n of currentSchedule) {
            const trigger = n.trigger as any;
            // 1. 유효하지 않은 트리거(과거의 반복 알림 등)는 즉시 취소
            if (!trigger || !trigger.date) {
                console.log('[Notifications] 유효하지 않은 트리거(반복/구형) 발견, 즉시 취소:', n.identifier);
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
                continue;
            }

            const d = new Date(trigger.date);
            if (isNaN(d.getTime())) {
                console.log('[Notifications] 오염된 날짜 데이터 발견, 즉시 취소:', n.identifier);
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
                continue;
            }

            // 날짜 정규화 (YYYY-MM-DD)
            const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            if (!notifsByDate[dateKey]) {
                notifsByDate[dateKey] = [];
            }
            notifsByDate[dateKey].push(n.identifier);
        }

        // 각 날짜별로 1개만 남기고 나머지는 모두 취소
        for (const [dateKey, ids] of Object.entries(notifsByDate)) {
            if (ids.length > 1) {
                console.log(`[Notifications] ${dateKey}에 ${ids.length}개의 중복 알림 발견, 정리 중...`);
                // 첫 번째 것만 남기고 나머지 취소
                for (let i = 1; i < ids.length; i++) {
                    await Notifications.cancelScheduledNotificationAsync(ids[i]);
                }
            }
        }

        // ─── 1단계: 오늘 메시지가 스토어에 이미 있는지 확인 ───
        const hasTodayInStore = messageStore.hasTodayMessage();

        if (hasTodayInStore) {
            // 오늘 메시지가 이미 존재함
            // 하지만 스토리지 키가 없을 수도 있으므로(데이터 삭제 등) 업데이트
            await AsyncStorage.setItem(SCHEDULE_DATE_KEY, todayStr);
        } else {
            // ─── 2단계: 오늘 메시지가 없다면 생성 ───
            // A. 오늘 날짜로 예약된 알림이 있는지 확인 (방금 중복 정리했으므로 최대 1개)
            const todayScheduleId = notifsByDate[todayStr]?.[0];

            if (todayScheduleId) {
                // 스케줄에 있음 -> 해당 메시지를 스토어로 동기화
                const scheduledNotif = currentSchedule.find(n => n.identifier === todayScheduleId);
                const data = scheduledNotif?.content.data as { messageId?: string };
                const msgObj = SAMPLE_MESSAGES.find(m => m.id === data?.messageId);

                if (msgObj && scheduledNotif) {
                    const triggerDate = new Date((scheduledNotif.trigger as any).date);
                    messageStore.addMessage({
                        id: msgObj.id,
                        content: msgObj.content,
                        category: msgObj.type,
                        receivedAt: triggerDate,
                        isRead: false,
                    });
                    useUserStore.getState().setLastMessage(msgObj.id, msgObj.type);

                    // ★ 핵심 수정: 동기화 후 해당 예약 알림을 즉시 취소
                    // 이렇게 하지 않으면 OS가 예약 시간에 알림을 또 보냄
                    await Notifications.cancelScheduledNotificationAsync(todayScheduleId);
                    console.log('[Notifications] 오늘 예약 알림 동기화 후 취소 완료:', todayScheduleId);
                }
            } else {
                // B. 스토어에도 없고 스케줄에도 없음 -> 즉시 발송 처리 (혹은 지난 알림 복구)
                const triggerDate = new Date();
                // 약간 과거로 설정하여 '도착함' 상태로 만듦
                triggerDate.setMinutes(triggerDate.getMinutes() - 1);

                const storedMsgId = await getScheduledMessageId(todayStr); // 이전에 저장해둔게 있는지 확인
                let selected;

                if (storedMsgId) {
                    selected = SAMPLE_MESSAGES.find(m => m.id === storedMsgId) || selectRandomMessage([]);
                    console.log('[Notifications] 저장된 예약 메시지 ID로 복구:', storedMsgId);
                } else {
                    // 예약된 모든 ID 수집 (중복 추천 방지)
                    const scheduledIds = currentSchedule
                        .map(n => (n.content.data as any)?.messageId)
                        .filter((id: string) => !!id);
                    selected = selectRandomMessage(scheduledIds);
                }

                messageStore.addMessage({
                    id: selected.id,
                    content: selected.content,
                    category: selected.type,
                    receivedAt: triggerDate,
                    isRead: false,
                });
                useUserStore.getState().setLastMessage(selected.id, selected.type);
                console.log('[Notifications] 오늘 메시지 즉시 생성 완료');
            }

            // 오늘 처리 완료 마킹
            await AsyncStorage.setItem(SCHEDULE_DATE_KEY, todayStr);
        }

        // ─── 3단계: 미래 스케줄링 보장 (내일부터 +7일) ───

        // 예약된 메시지 ID 목록 (중복 추천 방지용) update
        const finalSchedule = await Notifications.getAllScheduledNotificationsAsync();
        const scheduledIds = finalSchedule
            .map(n => (n.content.data as any)?.messageId)
            .filter((id: string) => !!id);

        const today = new Date();

        for (let i = 1; i <= 7; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);
            const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

            const exists = finalSchedule.some(n => {
                const trigger = n.trigger as any;
                if (!trigger?.date) return false;
                const d = new Date(trigger.date);
                const dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return dKey === dateKey;
            });

            if (!exists) {
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

                console.log(`[Notifications] 예약됨: ${dateKey} ${triggerTime.toLocaleTimeString()}`);
                await saveScheduledMessage(dateKey, selected.id);
            }
        }

    } catch (error) {
        console.error('[Notifications] 스케줄링 중 오류 발생:', error);
    } finally {
        isScheduling = false;
    }
}

/**
 * 알림 설정 변경 시 호출 - 미래 스케줄만 재설정 (오늘 메시지 보호)
 */
export async function rescheduleFromTomorrow(userTimeSlots: string[]) {
    try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        for (const n of scheduledNotifications) {
            const trigger = n.trigger as any;

            // 유효하지 않은 트리거(반복 알림 등)는 즉시 취소
            if (!trigger?.date) {
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
                console.log('[Notifications] reschedule: 유효하지 않은 트리거 취소:', n.identifier);
                continue;
            }

            const d = new Date(trigger.date);
            if (isNaN(d.getTime())) {
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
                console.log('[Notifications] reschedule: 오염된 날짜 취소:', n.identifier);
                continue;
            }

            const dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            // 오늘이 아닌(내일 이후) 알림 취소
            if (dKey !== todayKey) {
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
            }
        }

        if (userTimeSlots.length > 0) {
            await ensureMessageSchedule(userTimeSlots);
        }
    } catch (error) {
        console.error('[Notifications] 재스케줄링 중 오류 발생:', error);
    }
}

// 기존 함수 호환성 유지 (Onboarding 등에서 호출)
export async function scheduleRandomDailyMessage(userTimeSlots: string[], immediate: boolean = false) {
    return ensureMessageSchedule(userTimeSlots);
}
