import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 메시지 카테고리 타입
export type MessageCategory = 'cognitive' | 'mindfulness' | 'action' | 'emotion' | 'growth' | 'relationship' | 'selfcare';

export interface Message {
    id: string;
    content: string;
    category: MessageCategory;
    receivedAt: Date;
    isRead: boolean;
    isFavorite?: boolean;
}

interface MessageState {
    // 보관함 (모든 메시지 저장)
    messages: Message[];
    // 오늘의 메시지 (홈 화면 표시용)
    todayMessage: Message | null;
    todayDate: string | null; // "YYYY-MM-DD" 형식
    // 중복 방지용 (전체 메시지 사이클 관리)
    allReceivedIds: string[];

    // 단일 함수로 홈 + 보관함 동시 처리
    addMessage: (message: Message) => void;
    // 오늘 메시지가 있는지 확인
    hasTodayMessage: () => boolean;
    // 즐겨찾기 토글
    toggleFavorite: (id: string) => void;
    // 읽음 표시
    markAsRead: (id: string) => void;
    // 중복 방지: 받은 메시지 ID 확인
    getReceivedMessageIds: () => string[];
    // 모든 메시지를 다 봤을 때 리셋
    resetReceivedIds: () => void;
    // 전체 초기화
    resetMessages: () => void;
}

export const useMessageStore = create<MessageState>()(
    persist(
        (set, get) => ({
            messages: [],
            todayMessage: null,
            todayDate: null,
            allReceivedIds: [],

            // 핵심: 메시지 추가 (홈 + 보관함 동시 처리)
            addMessage: (message) => {
                // UTC가 아닌 로컬 시간 기준으로 '오늘' 날짜 생성 (YYYY-MM-DD)
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                const state = get();

                // 기존 메시지 리스트에서 같은 ID가 있다면 제거 (중복된 메시지 수신 시 최신화 효과)
                const existingFiltered = state.messages.filter(m => m.id !== message.id);

                // 새 메시지를 맨 앞에 추가 (최신 메시지가 위로)
                // 보관함은 최대 100개 유지
                const newMessages = [message, ...existingFiltered].slice(0, 100);

                set({
                    // 홈 화면용
                    todayMessage: message,
                    todayDate: todayStr,
                    // 보관함 업데이트
                    messages: newMessages,
                    // 중복 방지 ID 추가 (없으면 추가)
                    allReceivedIds: state.allReceivedIds.includes(message.id)
                        ? state.allReceivedIds
                        : [...state.allReceivedIds, message.id],
                });
            },

            hasTodayMessage: () => {
                const state = get();
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                return state.todayDate === todayStr && state.todayMessage !== null;
            },

            toggleFavorite: (id) => set((state) => ({
                messages: state.messages.map(m =>
                    m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
                ),
                todayMessage: state.todayMessage?.id === id
                    ? { ...state.todayMessage, isFavorite: !state.todayMessage.isFavorite }
                    : state.todayMessage,
            })),

            markAsRead: (id) => set((state) => ({
                messages: state.messages.map(m =>
                    m.id === id ? { ...m, isRead: true } : m
                ),
                todayMessage: state.todayMessage?.id === id
                    ? { ...state.todayMessage, isRead: true }
                    : state.todayMessage,
            })),

            getReceivedMessageIds: () => get().allReceivedIds,

            resetReceivedIds: () => set({ allReceivedIds: [] }),

            resetMessages: () => set({
                messages: [],
                todayMessage: null,
                todayDate: null,
                allReceivedIds: [],
            }),
        }),
        {
            name: 'mindping-message-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
