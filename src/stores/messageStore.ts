import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 메시지 카테고리 타입 - data.ts의 MessageData.type과 통일
export type MessageCategory = 'question' | 'comfort' | 'wisdom';

export interface Message {
    id: string;
    content: string;
    category: MessageCategory;
    receivedAt: Date;
    isRead: boolean;
    isFavorite?: boolean;
}

interface MessageState {
    messages: Message[];
    todayMessage: Message | null;

    // 액션
    setTodayMessage: (message: Message) => void;
    markAsRead: (id: string) => void;
    getRecentMessages: (count: number) => Message[];
    toggleFavorite: (id: string) => void;
    getFavoriteMessages: () => Message[];
    resetMessages: () => void;
}

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

            toggleFavorite: (id) => set((state) => ({
                messages: state.messages.map(m =>
                    m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
                ),
                todayMessage: state.todayMessage?.id === id
                    ? { ...state.todayMessage, isFavorite: !state.todayMessage.isFavorite }
                    : state.todayMessage,
            })),

            getFavoriteMessages: () => {
                return get().messages.filter(m => m.isFavorite);
            },

            resetMessages: () => set({
                messages: [],
                todayMessage: null,
            }),
        }),
        {
            name: 'mindping-message-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
