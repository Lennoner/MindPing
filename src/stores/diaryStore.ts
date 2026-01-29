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
    addEntry: (content: string) => void;
    updateEntry: (id: string, content: string) => void;
    deleteEntry: (id: string) => void;
    getEntryByDate: (date: string) => GratitudeEntry | undefined;
    getEntriesForMonth: (year: number, month: number) => GratitudeEntry[];
    resetDiary: () => void;
}

export const useDiaryStore = create<DiaryState>()(
    persist(
        (set, get) => ({
            entries: [],

            addEntry: (content) => {
                const today = new Date().toISOString().split('T')[0];
                const existingEntry = get().entries.find(e => e.date === today);

                if (existingEntry) {
                    // 오늘 이미 기록이 있으면 업데이트
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
                        date: today,
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

            resetDiary: () => set({ entries: [] }),
        }),
        {
            name: 'mindping-gratitude-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
