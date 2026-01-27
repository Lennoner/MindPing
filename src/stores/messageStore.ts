import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
    id: string;
    content: string;
    category: 'comfort' | 'acceptance' | 'encouragement' | 'info';
    receivedAt: Date;
    isRead: boolean;
}

interface MessageState {
    messages: Message[];
    todayMessage: Message | null;

    // 액션
    setTodayMessage: (message: Message) => void;
    markAsRead: (id: string) => void;
    getRecentMessages: (count: number) => Message[];
}

// 샘플 메시지 (MVP용)
const SAMPLE_MESSAGES = [
    { id: '1', content: '오늘 하루도 수고 많았어요. 당신은 충분히 잘하고 있어요.', category: 'comfort' as const },
    { id: '2', content: '완벽하지 않아도 괜찮아요. 그게 바로 우리의 모습이니까요.', category: 'acceptance' as const },
    { id: '3', content: '작은 것부터 시작해도 괜찮아요. 한 걸음씩 나아가는 거예요.', category: 'encouragement' as const },
    { id: '4', content: '힘들 때는 잠시 쉬어가도 돼요. 쉬는 것도 용기예요.', category: 'comfort' as const },
    { id: '5', content: '지금 이 순간, 당신은 최선을 다하고 있어요.', category: 'encouragement' as const },
    { id: '6', content: '우울할 땐 5분만 햇볕을 쬐어보세요. 작은 변화가 도움이 될 수 있어요.', category: 'info' as const },
    { id: '7', content: '당신의 감정은 모두 소중해요. 슬퍼도, 화가 나도 괜찮아요.', category: 'acceptance' as const },
    { id: '8', content: '누군가는 지금 이 순간에도 당신을 응원하고 있어요.', category: 'comfort' as const },
    { id: '9', content: '오늘 하루가 힘들었다면, 내일은 조금 더 나아질 거예요.', category: 'encouragement' as const },
    { id: '10', content: '불안할 때는 천천히 숨을 쉬어보세요. 4초 들이쉬고, 4초 내쉬고.', category: 'info' as const },
];

export const useMessageStore = create<MessageState>()(
    persist(
        (set, get) => ({
            messages: [],
            todayMessage: null,

            setTodayMessage: (message) => {
                set((state) => ({
                    todayMessage: message,
                    messages: [message, ...state.messages].slice(0, 30), // 최근 30개만 유지
                }));
            },

            markAsRead: (id) => set((state) => ({
                messages: state.messages.map(m =>
                    m.id === id ? { ...m, isRead: true } : m
                ),
                todayMessage: state.todayMessage?.id === id
                    ? { ...state.todayMessage, isRead: true }
                    : state.todayMessage,
            })),

            getRecentMessages: (count) => {
                return get().messages.slice(0, count);
            },
        }),
        {
            name: 'mindping-message-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// 오늘의 메시지 가져오기 (랜덤)
export const getTodayRandomMessage = (): Message => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_MESSAGES.length);
    const sample = SAMPLE_MESSAGES[randomIndex];
    return {
        ...sample,
        id: `${Date.now()}-${randomIndex}`,
        receivedAt: new Date(),
        isRead: false,
    };
};
