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

// 메시지 데이터
export interface MessageData {
    id: string;
    type: 'question' | 'comfort' | 'wisdom';
    content: string;
    emoji: string;
}

export const SAMPLE_MESSAGES: MessageData[] = [
    // [관점 전환 + 팩트] wisdom
    { id: '1', type: 'wisdom', content: '나쁜 날들이 나쁜 인생이라고 착각하게 만들 수 있어요. 하지만 100일 연속 안 좋은 날이어도 그건 1년의 27%일 뿐이에요. 내일은 좋을 수 있어요.', emoji: '📊' },
    { id: '2', type: 'wisdom', content: '완벽한 하루는 없어요. 그저 괜찮은 순간들이 모여서 괜찮은 하루가 되는 거예요.', emoji: '🧩' },
    { id: '3', type: 'wisdom', content: '우리 뇌는 부정적인 것을 5배 더 강하게 기억해요. 그래서 안 좋은 일이 더 크게 느껴지는 거예요. 당신 잘못이 아니에요.', emoji: '🧠' },
    { id: '4', type: 'wisdom', content: '감정은 평균 90초만 지속돼요. 그 이후는 우리가 그 감정을 붙잡고 있는 거예요. 언제든 놓아도 괜찮아요.', emoji: '⏱️' },
    { id: '5', type: 'wisdom', content: '비교는 진실의 절반만 보여줘요. 다른 사람의 10점 순간과 당신의 3점 순간을 비교하고 있는 거예요.', emoji: '⚖️' },
    { id: '6', type: 'wisdom', content: '실패는 당신이 부족해서가 아니라 도전했다는 증거예요. 시도조차 안 하는 사람은 실패할 수도 없거든요.', emoji: '🏆' },
    { id: '7', type: 'wisdom', content: '"아직"이라는 단어는 마법이에요. "못해"가 아니라 "아직 못해"예요. 가능성은 열려 있어요.', emoji: '✨' },
    { id: '8', type: 'wisdom', content: '어제보다 1% 나아지면 1년 후엔 37배 성장하는 거예요. 오늘 완벽할 필요 없어요.', emoji: '📈' },
    { id: '9', type: 'comfort', content: '회복탄력성은 힘들어하지 않는 게 아니에요. 힘들어도 다시 일어서는 거예요. 지금 당신이 그걸 하고 있어요.', emoji: '🌱' },
    { id: '10', type: 'comfort', content: '지금 힘든 게 당연해요. 쉬운 일을 하고 있는 게 아니니까요.', emoji: '🏔️' },
    { id: '11', type: 'wisdom', content: 'SNS 30분만 줄여도 외로움이 현저히 감소한다는 연구가 있어요. 비교를 줄이면 평화가 늘어나요.', emoji: '📵' },
    { id: '12', type: 'wisdom', content: '습관은 평균 66일이 걸려요. 3주 안에 안 되는 게 정상이에요. 조급해하지 마세요.', emoji: '🗓️' },
    { id: '13', type: 'comfort', content: '완벽주의는 높은 기준이 아니라 두려움이에요. 완벽해야 사랑받는다는 착각이죠. 그렇지 않아요.', emoji: '🛡️' },
    { id: '14', type: 'wisdom', content: '10분만 걸어도 기분이 2시간 동안 좋아진다는 연구 결과가 있어요. 움직임은 감정의 리모컨이에요.', emoji: '🚶' },
    { id: '15', type: 'comfort', content: '번아웃은 당신이 약해서가 아니에요. 오히려 오랫동안 너무 강하게 버텨왔다는 증거예요.', emoji: '🔋' },
    { id: '16', type: 'comfort', content: '생산성이 당신의 가치를 결정하지 않아요. 당신은 존재하는 것만으로 충분히 가치 있어요.', emoji: '💎' },
    { id: '17', type: 'comfort', content: '감사는 근육과 같아요. 자주 쓸수록 강해지죠. 오늘 하나만 떠올려봐도 충분해요.', emoji: '🙏' },
    { id: '18', type: 'wisdom', content: '휴식은 포기가 아니라 전략이에요. 90분 집중 후 15분 쉬는 게 가장 효율적이래요.', emoji: '⏸️' },
    { id: '19', type: 'wisdom', content: '자신에게 친절하게 말하는 사람이 스트레스에 더 잘 대처한다는 연구가 있어요. 스스로에게 따뜻하게 말해도 괜찮아요.', emoji: '🗣️' },
    { id: '20', type: 'wisdom', content: '변화는 직선이 아니라 파도예요. 오늘 후퇴한 것 같아도 전체적으론 전진하고 있을 수 있어요.', emoji: '🌊' },

    // [공감 + 인사이트] comfort
    { id: '21', type: 'comfort', content: '힘들다고 말하는 건 약함이 아니라 용기예요. 인정하는 것부터 시작이거든요.', emoji: '🦁' },
    { id: '22', type: 'comfort', content: '모든 사람이 힘든 시기가 있어요. 당신만 그런 게 절대 아니에요. 혼자가 아니에요.', emoji: '🤝' },
    { id: '23', type: 'comfort', content: '오늘 아무것도 못한 것 같아도, 하루를 버틴 것만으로 충분히 많은 걸 한 거예요.', emoji: '🧱' },
    { id: '24', type: 'comfort', content: '당신의 감정은 틀린 게 아니에요. 느끼는 대로 느껴도 괜찮아요. 그게 정상이에요.', emoji: '👌' },
    { id: '25', type: 'comfort', content: '완벽하지 않은 하루도 살아낸 하루예요. 그것만으로 충분해요.', emoji: '🌅' },
    { id: '26', type: 'comfort', content: '지금 이 순간을 버티는 것만으로도 당신은 정말 강한 사람이에요.', emoji: '💪' },
    { id: '27', type: 'comfort', content: '"괜찮아"라고 말할 필요 없어요. 괜찮지 않아도 괜찮아요.', emoji: '☔' },
    { id: '28', type: 'comfort', content: '눈물은 약함의 신호가 아니라 감정의 언어예요. 울고 싶을 땐 울어도 돼요.', emoji: '💧' },
    { id: '29', type: 'comfort', content: '모두가 당신처럼 열심히 사는 건 아니에요. 당신이 얼마나 애쓰는지, 제가 알아요.', emoji: '👁️' },
    { id: '30', type: 'comfort', content: '작은 것에 기뻐하는 게 소박한 게 아니에요. 그게 진짜 행복을 아는 거예요.', emoji: '🍀' },
    { id: '31', type: 'comfort', content: '남들과 다른 속도로 가는 게 늦은 게 아니에요. 각자의 타이밍이 있어요.', emoji: '🕐' },
    { id: '32', type: 'comfort', content: '쉬는 것도 일이에요. 회복은 나태함이 아니라 필수예요.', emoji: '🛌' },
    { id: '33', type: 'wisdom', content: '실수는 당신이 배우고 있다는 증거예요. 시도하지 않는 사람은 실수할 수도 없거든요.', emoji: '📝' },
    { id: '34', type: 'comfort', content: '오늘 최선이 어제보다 못해도 괜찮아요. 그게 지금의 최선이에요.', emoji: '📉' },
    { id: '35', type: 'comfort', content: '포기하고 싶을 때가 가장 가까이 온 순간일 수 있어요. 조금만 더요.', emoji: '🚩' },
    { id: '36', type: 'comfort', content: '당신이 느끼는 모든 감정은 타당해요. 설명할 필요도, 정당화할 필요도 없어요.', emoji: '✅' },
    { id: '37', type: 'comfort', content: '지친 건 게으른 게 아니라 충분히 애썼다는 뜻이에요.', emoji: '😓' },
    { id: '38', type: 'comfort', content: '모든 걸 잘할 필요는 없어요. 몇 가지만 잘해도 충분히 훌륭한 거예요.', emoji: '🎯' },
    { id: '39', type: 'comfort', content: '오늘 누군가에게 친절했다면, 당신은 세상을 조금 더 나은 곳으로 만든 거예요.', emoji: '🌍' },
    { id: '40', type: 'comfort', content: '당신의 존재가 누군가에게는 위로예요. 그 사실을 잊지 마세요.', emoji: '🕯️' },

    // [위로 + 희망] comfort
    { id: '41', type: 'comfort', content: '어둠 속에서도 별은 빛나요. 지금이 어두워도 당신 안의 빛은 여전히 있어요.', emoji: '🌟' },
    { id: '42', type: 'comfort', content: '힘든 시기는 영원하지 않아요. 모든 폭풍우는 결국 지나가요.', emoji: '⛈️' },
    { id: '43', type: 'comfort', content: '오늘이 최악이라면 내일은 나아질 수밖에 없어요. 바닥을 찍었다는 건 올라갈 일만 남았다는 뜻이니까요.', emoji: '🚀' },
    { id: '44', type: 'comfort', content: '당신이 겪고 있는 이 모든 건 나중에 누군가를 이해하는 힘이 될 거예요.', emoji: '❤️' },
    { id: '45', type: 'comfort', content: '지금 보이지 않아도 괜찮아요. 안개 속에서도 길은 계속 이어져 있어요.', emoji: '🌫️' },
    { id: '46', type: 'comfort', content: '힘들 땐 크게 성장하는 중일 수 있어요. 나무도 폭풍우 속에서 더 깊이 뿌리내리거든요.', emoji: '🌳' },
    { id: '47', type: 'wisdom', content: '실패한 날도 데이터예요. 무엇이 안 되는지 배웠으니 헛된 날은 아니에요.', emoji: '📊' },
    { id: '48', type: 'comfort', content: '오늘 한 발짝도 못 갔다면, 제자리에서 버틴 거예요. 그것도 대단한 거예요.', emoji: '🛑' },
    { id: '49', type: 'comfort', content: '당신의 이야기는 아직 끝나지 않았어요. 지금은 힘든 챕터일 뿐이에요.', emoji: '📖' },
    { id: '50', type: 'comfort', content: '어제의 당신이 오늘의 당신을 만들었고, 오늘의 당신이 내일의 당신을 만들어요. 시간은 당신 편이에요.', emoji: '⏳' },
    { id: '51', type: 'wisdom', content: '모든 시작은 작아요. 오늘의 작은 선택이 1년 후 큰 변화가 되어 있을 거예요.', emoji: '🌱' },
    { id: '52', type: 'comfort', content: '힘든 만큼 강해지고 있어요. 근육이 아플 때 자라는 것처럼요.', emoji: '🏋️' },
    { id: '53', type: 'comfort', content: '포기하지 않고 여기까지 온 것만으로 당신은 이미 승리하고 있어요.', emoji: '🏅' },
    { id: '54', type: 'comfort', content: '내일은 오늘보다 나을 수 있어요. 가능성은 항상 열려 있어요.', emoji: '🚪' },
    { id: '55', type: 'comfort', content: '지금 이 순간도 지나갈 거예요. 그리고 당신은 또다시 일어설 거예요. 항상 그래왔으니까요.', emoji: '🌄' },

    // [일상의 지혜] wisdom
    { id: '56', type: 'wisdom', content: '미소는 뇌를 속여요. 억지로라도 미소 지으면 실제로 기분이 좋아진다는 연구가 있어요.', emoji: '😊' },
    { id: '57', type: 'wisdom', content: '물을 충분히 마시면 피로가 줄어들어요. 때로는 탈수가 우울함으로 느껴지기도 해요.', emoji: '💧' },
    { id: '58', type: 'wisdom', content: '햇빛 5분이면 세로토닌이 분비돼요. 잠깐 창문 밖을 보는 것도 도움이 돼요.', emoji: '☀️' },
    { id: '59', type: 'wisdom', content: '천천히 호흡하면 부교감신경이 활성화되어 몸이 자동으로 진정돼요. 마법 같은 일이에요.', emoji: '🌬️' },
    { id: '60', type: 'wisdom', content: '좋아하는 노래 하나면 기분이 바뀔 수 있어요. 음악은 감정의 리모컨이거든요.', emoji: '🎧' },
    { id: '61', type: 'wisdom', content: '정리된 공간은 정리된 마음을 만들어요. 작은 것 하나만 치워도 차이가 나요.', emoji: '🧹' },
    { id: '62', type: 'wisdom', content: '수면 부족은 부정적 감정을 60% 더 증폭시켜요. 잠은 최고의 감정 조절 도구예요.', emoji: '😴' },
    { id: '63', type: 'wisdom', content: '누군가에게 친절하면 본인의 행복도가 올라가요. 베푸는 것도 자기돌봄이에요.', emoji: '🎁' },
    { id: '64', type: 'wisdom', content: '웃음은 전염돼요. 당신의 미소가 누군가의 하루를 바꿀 수 있어요.', emoji: '😄' },
    { id: '65', type: 'wisdom', content: '자연을 5분만 봐도 스트레스가 줄어들어요. 창밖의 나무 한 그루도 충분해요.', emoji: '🌲' },

    // [가벼운 성찰] question
    { id: '66', type: 'question', content: '오늘 하루, 딱 한 순간만 기억한다면 어떤 순간일까요?', emoji: '📷' },
    { id: '67', type: 'question', content: '지금 이 순간에 필요한 건 휴식일까요, 아니면 움직임일까요?', emoji: '⚖️' },
    { id: '68', type: 'question', content: '오늘 당신을 미소 짓게 한 작은 것이 있었나요?', emoji: '🙂' },
    { id: '69', type: 'question', content: '지금 기분을 색깔로 표현한다면 무슨 색일까요?', emoji: '🎨' },
    { id: '70', type: 'question', content: '오늘 누군가가 당신에게 해준 친절이 있었나요?', emoji: '💌' },
    { id: '71', type: 'question', content: '지금 창밖 하늘은 어떤가요? 잠깐 한번 봐도 될까요?', emoji: '☁️' },
    { id: '72', type: 'question', content: '오늘 내가 잘한 일, 딱 하나만 떠올린다면요?', emoji: '👍' },
    { id: '73', type: 'question', content: '지금 가장 필요한 게 뭘까요? 물 한 잔? 깊은 숨? 아니면 그냥 잠깐의 침묵?', emoji: '🍵' },
    { id: '74', type: 'question', content: '1년 후의 나는 지금의 나에게 뭐라고 말해줄까요?', emoji: '📞' },
    { id: '75', type: 'question', content: '오늘 하루를 한 문장으로 표현한다면요?', emoji: '🖋️' },
    { id: '76', type: 'question', content: '지금 몸에서 가장 긴장된 곳은 어디인가요? 어깨? 턱? 주먹?', emoji: '💆' },
    { id: '77', type: 'question', content: '최근에 스스로에게 친절했던 적이 있나요?', emoji: '🥯' },
    { id: '78', type: 'question', content: '오늘 감사한 일이 딱 하나 있다면 뭘까요?', emoji: '🙏' },
    { id: '79', type: 'question', content: '지금 당장 5분의 자유시간이 생긴다면 뭘 하고 싶으세요?', emoji: '☕' },
    { id: '80', type: 'question', content: '오늘 나를 자랑스럽게 만든 순간이 있었나요? 아주 작은 것도 괜찮아요.', emoji: '🏅' },

    // [감정 체크] question
    { id: '81', type: 'question', content: '지금 기분을 한 단어로 표현하면 뭘까요?', emoji: '🏷️' },
    { id: '82', type: 'question', content: '0부터 10까지, 지금 내 에너지는 몇일까요?', emoji: '🔋' },
    { id: '83', type: 'question', content: '지금 가장 큰 감정이 뭔가요? 이름을 붙여보면요?', emoji: '📛' },
    { id: '84', type: 'question', content: '오늘 하루 중 가장 평온했던 순간은 언제였나요?', emoji: '🧘' },
    { id: '85', type: 'question', content: '지금 이 순간, 몸은 뭐라고 말하고 있나요?', emoji: '🩺' },
    { id: '86', type: 'question', content: '오늘 당신을 가장 힘들게 한 건 뭐였나요?', emoji: '🪨' },
    { id: '87', type: 'question', content: '지금 놓아버리고 싶은 생각이나 걱정이 있나요?', emoji: '🎈' },
    { id: '88', type: 'question', content: '최근에 마음이 가벼워진 순간이 있었나요?', emoji: '🍃' },
    { id: '89', type: 'question', content: '오늘 울고 싶었던 순간이 있었나요? 울어도 괜찮아요.', emoji: '🤧' },
    { id: '90', type: 'question', content: '지금 누군가에게 듣고 싶은 말이 있다면요?', emoji: '👂' },

    // [미래 지향] question
    { id: '91', type: 'question', content: '내일의 나에게 응원 메시지를 보낸다면요?', emoji: '💌' },
    { id: '92', type: 'question', content: '다음 주에 나를 위해 하고 싶은 작은 일이 있나요?', emoji: '📅' },
    { id: '93', type: 'question', content: '오늘 배운 게 있다면 뭘까요?', emoji: '🎓' },
    { id: '94', type: 'question', content: '내일 아침, 어떤 기분으로 눈을 뜨고 싶으세요?', emoji: '🌅' },
    { id: '95', type: 'question', content: '1년 후 나는 어떤 모습일까요? 상상해봐도 될까요?', emoji: '🚀' },
    { id: '96', type: 'question', content: '다음에 여유가 생기면 나에게 주고 싶은 선물이 있나요?', emoji: '🎁' },
    { id: '97', type: 'question', content: '오늘의 나는 어제의 나보다 나아졌을까요? 1%라도요?', emoji: '📈' },
    { id: '98', type: 'question', content: '지금 바꿀 수 있는 작은 것이 있다면 뭘까요?', emoji: '🔧' },
    { id: '99', type: 'question', content: '내일은 오늘보다 나을 수 있을까요?', emoji: '🌤️' },
    { id: '100', type: 'question', content: '한 달 후, 오늘을 돌아본다면 어떤 기억으로 남을까요?', emoji: '🎞️' },
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
        title: '완전 무료, 안심하세요',
        description: '회원가입도, 결제도 필요 없어요.\n그냥 편안하게 위로만 받으세요.',
    },
];
