import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GratitudeEntry {
    id: string;
    date: string; // YYYY-MM-DD
    content: string; // 감사 내용
    createdAt: Date;
}

interface DiaryState {
    entries: GratitudeEntry[];

    // 액션
    addEntry: (content: string, date?: string) => void;
    updateEntry: (id: string, content: string) => void;
    deleteEntry: (id: string) => void;
    getEntryByDate: (date: string) => GratitudeEntry | undefined;
    getEntriesForMonth: (year: number, month: number) => GratitudeEntry[];
    getCurrentStreak: () => number;
    resetDiary: () => void;
}

export const useDiaryStore = create<DiaryState>()(
    persist(
        (set, get) => ({
            entries: [],

            addEntry: (content, dateStr) => {
                const date = dateStr || new Date().toISOString().split('T')[0];
                const existingEntry = get().entries.find(e => e.date === date);

                if (existingEntry) {
                    // 이미 기록이 있으면 업데이트
                    set((state) => ({
                        entries: state.entries.map(e =>
                            e.id === existingEntry.id
                                ? { ...e, content, createdAt: new Date() }
                                : e
                        )
                    }));
                } else {
                    // 새 기록 추가
                    const newEntry: GratitudeEntry = {
                        id: Date.now().toString(),
                        date,
                        content,
                        createdAt: new Date(),
                    };
                    set((state) => ({ entries: [...state.entries, newEntry] }));
                }
            },

            updateEntry: (id, content) => set((state) => ({
                entries: state.entries.map(e =>
                    e.id === id ? { ...e, content, createdAt: new Date() } : e
                )
            })),

            deleteEntry: (id) => set((state) => ({
                entries: state.entries.filter(e => e.id !== id)
            })),

            getEntryByDate: (date) => {
                return get().entries.find(e => e.date === date);
            },

            getEntriesForMonth: (year, month) => {
                const prefix = `${year}-${String(month).padStart(2, '0')}`;
                return get().entries.filter(e => e.date.startsWith(prefix));
            },

            getCurrentStreak: () => {
                const entries = get().entries;
                if (entries.length === 0) return 0;

                // 기록된 날짜 Set 생성
                const dateSet = new Set(entries.map(e => e.date));

                // 오늘 날짜 (YYYY-MM-DD)
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];

                // 오늘 기록이 있으면 오늘부터, 없으면 어제부터 카운트
                let streak = 0;
                const startDate = new Date(today);
                if (!dateSet.has(todayStr)) {
                    startDate.setDate(startDate.getDate() - 1);
                }

                // 역순으로 연속 날짜 카운트
                const checkDate = new Date(startDate);
                while (true) {
                    const dateStr = checkDate.toISOString().split('T')[0];
                    if (dateSet.has(dateStr)) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                }

                return streak;
            },

            resetDiary: () => set({ entries: [] }),
        }),
        {
            name: 'mindping-gratitude-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
