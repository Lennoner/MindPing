import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeSlot } from '../constants';

interface User {
    nickname: string;
    createdAt: Date;
}

interface UserState {
    // 사용자 정보
    user: User | null;
    isOnboarded: boolean;

    // 설정
    preferredTimeSlots: TimeSlot[];
    notificationsEnabled: boolean;

    // 메시지 수신 이력
    lastMessageId: string | null;
    lastMessageType: 'question' | 'comfort' | 'wisdom' | null;

    // 액션
    setUser: (user: User) => void;
    updateUser: (updates: Partial<User>) => void;
    resetUser: () => void;

    setOnboarded: (value: boolean) => void;
    setPreferredTimeSlots: (slots: TimeSlot[]) => void;
    setNotificationsEnabled: (enabled: boolean) => void;

    setLastMessage: (id: string, type: 'question' | 'comfort' | 'wisdom') => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            // 초기 상태
            user: null,
            isOnboarded: false,

            preferredTimeSlots: ['forenoon', 'afternoon', 'evening'],
            notificationsEnabled: true,

            lastMessageId: null,
            lastMessageType: null,

            // 액션
            setUser: (user) => set({ user }),

            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),

            resetUser: () => set({
                user: null,
                isOnboarded: false,
                preferredTimeSlots: ['forenoon', 'afternoon', 'evening'],
                notificationsEnabled: true,
                lastMessageId: null,
                lastMessageType: null,
            }),

            setOnboarded: (value) => set({ isOnboarded: value }),

            setPreferredTimeSlots: (slots) => set({ preferredTimeSlots: slots }),

            setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

            setLastMessage: (id, type) => set({
                lastMessageId: id,
                lastMessageType: type,
            }),
        }),
        {
            name: 'mindping-user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
