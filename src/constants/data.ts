// 시간대 설정
export type TimeSlot = 'morning' | 'forenoon' | 'afternoon' | 'evening' | 'night';

export interface TimeSlotOption {
    id: TimeSlot;
    label: string;
    range: string;
    startHour: number;
    endHour: number;
}

export const TIME_SLOTS: TimeSlotOption[] = [
    { id: 'morning', label: '아침', range: '6:00 - 9:00', startHour: 6, endHour: 9 },
    { id: 'forenoon', label: '오전', range: '9:00 - 12:00', startHour: 9, endHour: 12 },
    { id: 'afternoon', label: '오후', range: '12:00 - 18:00', startHour: 12, endHour: 18 },
    { id: 'evening', label: '저녁', range: '18:00 - 22:00', startHour: 18, endHour: 22 },
    { id: 'night', label: '밤', range: '22:00 - 24:00', startHour: 22, endHour: 24 },
];

// 샘플 메시지 데이터
export interface MessageData {
    id: string;
    type: 'question' | 'comfort' | 'wisdom';
    content: string;
    emoji: string;
}

export const SAMPLE_MESSAGES: MessageData[] = [
    { id: '1', type: 'question', content: '"오늘 당신에게 일어난 일 중, \'의외로 괜찮았던\' 순간이 있었나요? 아주 사소한 것이라도 좋습니다."', emoji: '🤔' },
    { id: '2', type: 'comfort', content: '감정은 날씨와 같습니다. 폭풍우가 영원히 지속되지 않듯, 지금의 우울감도 반드시 지나갑니다.', emoji: '💡' },
    { id: '3', type: 'question', content: '만약 가장 친한 친구가 지금 당신과 똑같은 상황이라면, 그에게 어떤 말을 해주고 싶나요?', emoji: '🤗' },
    { id: '4', type: 'wisdom', content: '완벽하지 않아도 괜찮아요. \'적당히\' 하는 것만으로도 충분히 잘하고 있는 것입니다.', emoji: '🍀' },
    { id: '5', type: 'comfort', content: '오늘 하루도 수고 많았어요. 당신은 충분히 잘하고 있어요.', emoji: '💜' },
    { id: '6', type: 'wisdom', content: '힘들 때는 잠시 쉬어가도 돼요. 쉬는 것도 용기예요.', emoji: '☁️' },
    { id: '7', type: 'question', content: '오늘 당신이 스스로에게 해주고 싶은 말은 무엇인가요?', emoji: '💭' },
    { id: '8', type: 'comfort', content: '누군가는 지금 이 순간에도 당신을 응원하고 있어요.', emoji: '✨' },
];

// 온보딩 슬라이드
export interface OnboardingSlide {
    id: number;
    title: string;
    description: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
    {
        id: 1,
        title: '예측할 수 없는 순간에',
        description: '매일 다른 시간, 예상치 못한 순간에\n따뜻한 위로가 찾아갑니다.',
    },
    {
        id: 2,
        title: '아무것도 하지 않아도 돼요',
        description: '앱을 열지 않아도, 기록하지 않아도\n메시지가 먼저 다가갑니다.',
    },
    {
        id: 3,
        title: '7일 무료로 시작하세요',
        description: '카드 등록 없이 바로 시작할 수 있어요.\n마음에 드시면 그때 결정하세요.',
    },
];

// 감정 데이터
export type EmotionType = 'good' | 'soso' | 'sad' | 'anxious' | 'angry';

export interface EmotionOption {
    type: EmotionType;
    label: string;
    emoji: string;
}

export const EMOTIONS: EmotionOption[] = [
    { type: 'good', label: '좋음', emoji: '😊' },
    { type: 'soso', label: '그저그럼', emoji: '😐' },
    { type: 'sad', label: '슬픔', emoji: '😢' },
    { type: 'anxious', label: '불안', emoji: '😰' },
    { type: 'angry', label: '화남', emoji: '😡' },
];
