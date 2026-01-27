import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeSlot, PlanType } from '../constants';

interface User {
    id: string;
    nickname: string;
    email?: string;
    ageGroup?: string;
    concerns?: string[];
    createdAt: Date;
}

interface UserState {
    // 사용자 정보
    user: User | null;
    isAuthenticated: boolean;
    isOnboarded: boolean;

    // 설정
    preferredTimeSlots: TimeSlot[];
    notificationsEnabled: boolean;

    // 구독
    subscriptionPlan: PlanType;
    subscriptionEndDate: Date | null;
    isTrialActive: boolean;

    // 액션
    setUser: (user: User) => void;
    updateUser: (updates: Partial<User>) => void;
    logout: () => void;

    setOnboarded: (value: boolean) => void;
    setPreferredTimeSlots: (slots: TimeSlot[]) => void;
    setNotificationsEnabled: (enabled: boolean) => void;

    setSubscription: (plan: PlanType, endDate: Date | null) => void;
    startTrial: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            // 초기 상태
            user: null,
            isAuthenticated: false,
            isOnboarded: false,

            preferredTimeSlots: ['forenoon', 'afternoon', 'evening'],
            notificationsEnabled: true,

            subscriptionPlan: 'free',
            subscriptionEndDate: null,
            isTrialActive: false,

            // 액션
            setUser: (user) => set({ user, isAuthenticated: true }),

            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),

            logout: () => set({
                user: null,
                isAuthenticated: false,
                subscriptionPlan: 'free',
                subscriptionEndDate: null,
                isTrialActive: false,
            }),

            setOnboarded: (value) => set({ isOnboarded: value }),

            setPreferredTimeSlots: (slots) => set({ preferredTimeSlots: slots }),

            setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

            setSubscription: (plan, endDate) => set({
                subscriptionPlan: plan,
                subscriptionEndDate: endDate,
                isTrialActive: false,
            }),

            startTrial: () => {
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 7);
                set({
                    subscriptionPlan: 'free',
                    subscriptionEndDate: endDate,
                    isTrialActive: true,
                });
            },
        }),
        {
            name: 'mindping-user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
