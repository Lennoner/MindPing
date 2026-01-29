import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DiaryEntry {
    id: string;
    date: string; // YYYY-MM-DD
    content: string;
    createdAt: Date;
}

interface DiaryState {
    entries: DiaryEntry[];

    // 액션
    addEntry: (content: string) => void;
    updateEntry: (id: string, content: string) => void;
    deleteEntry: (id: string) => void;
    getEntryByDate: (date: string) => DiaryEntry | undefined;
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
                    const newEntry: DiaryEntry = {
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
        }),
        {
            name: 'mindping-diary-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
