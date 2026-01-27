import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmotionType } from '../constants';

export interface DiaryEntry {
    id: string;
    date: string; // YYYY-MM-DD
    emotion: EmotionType;
    memo?: string;
    createdAt: Date;
}

interface DiaryState {
    entries: DiaryEntry[];

    // 액션
    addEntry: (emotion: EmotionType, memo?: string) => void;
    updateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
    deleteEntry: (id: string) => void;
    getEntryByDate: (date: string) => DiaryEntry | undefined;
    getEntriesForMonth: (year: number, month: number) => DiaryEntry[];
}

export const useDiaryStore = create<DiaryState>()(
    persist(
        (set, get) => ({
            entries: [],

            addEntry: (emotion, memo) => {
                const today = new Date().toISOString().split('T')[0];
                const existingEntry = get().entries.find(e => e.date === today);

                if (existingEntry) {
                    // 오늘 이미 기록이 있으면 업데이트
                    set((state) => ({
                        entries: state.entries.map(e =>
                            e.id === existingEntry.id
                                ? { ...e, emotion, memo, createdAt: new Date() }
                                : e
                        )
                    }));
                } else {
                    // 새 기록 추가
                    const newEntry: DiaryEntry = {
                        id: Date.now().toString(),
                        date: today,
                        emotion,
                        memo,
                        createdAt: new Date(),
                    };
                    set((state) => ({ entries: [...state.entries, newEntry] }));
                }
            },

            updateEntry: (id, updates) => set((state) => ({
                entries: state.entries.map(e =>
                    e.id === id ? { ...e, ...updates } : e
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
        }),
        {
            name: 'mindping-diary-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
