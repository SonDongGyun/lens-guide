export type PurposeId =
  | "screen"
  | "driving"
  | "reading"
  | "indoor_outdoor"
  | "outdoor"
  | "lightweight"
  | "progressive_curious";

export type DiscomfortId =
  | "thickness"
  | "night_glare"
  | "eye_fatigue"
  | "near_far_switch"
  | "smudge"
  | "brightness"
  | "unsure";

export type LensTypeId = "single" | "progressive" | "office";
export type IndexId = "1.56" | "1.60" | "1.67" | "1.74";
export type CoatingId = "ar" | "blue" | "photochromic" | "hydrophobic" | "scratch";

export const PURPOSES: {
  id: PurposeId;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  { id: "screen", label: "컴퓨터·모바일을 오래 봐요", desc: "재택, 사무, 학습 등 화면 시간이 긴 편", emoji: "💻" },
  { id: "driving", label: "운전을 자주 해요", desc: "출퇴근 운전, 야간 운전 포함", emoji: "🚗" },
  { id: "reading", label: "책·서류를 오래 봐요", desc: "독서, 문서, 디테일한 작업", emoji: "📖" },
  { id: "indoor_outdoor", label: "실내외 이동이 많아요", desc: "외근, 출장, 잦은 이동", emoji: "🚶" },
  { id: "outdoor", label: "야외활동이 많아요", desc: "운동, 골프, 캠핑, 산책", emoji: "⛰️" },
  { id: "lightweight", label: "가볍고 얇은 렌즈를 원해요", desc: "오래 써도 부담 없는 착용감", emoji: "🪶" },
  { id: "progressive_curious", label: "처음 다초점이 궁금해요", desc: "노안 초기, 다초점 비교 희망", emoji: "👓" },
];

export const DISCOMFORTS: {
  id: DiscomfortId;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  { id: "thickness", label: "렌즈가 두껍고 무거워요", desc: "옆에서 보면 두께가 많이 보임", emoji: "📏" },
  { id: "night_glare", label: "야간 빛 반사가 거슬려요", desc: "헤드라이트, 가로등 번짐", emoji: "🌙" },
  { id: "eye_fatigue", label: "화면 보면 눈이 피로해요", desc: "장시간 모니터·폰 사용", emoji: "😵‍💫" },
  { id: "near_far_switch", label: "가까움과 먼 거리 전환이 불편", desc: "초점 이동이 흐릿하거나 어지러움", emoji: "🔁" },
  { id: "smudge", label: "지문·물때가 잘 묻어요", desc: "닦아도 금세 더러워짐", emoji: "💧" },
  { id: "brightness", label: "햇빛에 눈이 부셔요", desc: "야외 활동시 눈부심", emoji: "☀️" },
  { id: "unsure", label: "어떤 옵션이 필요한지 모르겠어요", desc: "비교부터 차근차근 보고 싶음", emoji: "🤔" },
];

export const LENS_TYPES: Record<
  LensTypeId,
  {
    id: LensTypeId;
    label: string;
    tagline: string;
    description: string;
    bestFor: string;
    zones: { near: number; mid: number; far: number };
  }
> = {
  single: {
    id: "single",
    label: "단초점 렌즈",
    tagline: "한 거리에 또렷한 시야",
    description: "근거리 또는 원거리 한 곳에 초점이 맞춰진 가장 보편적인 렌즈입니다. 한 가지 사용 거리가 분명할 때 가장 자연스럽습니다.",
    bestFor: "원거리 시력 교정, 단순한 일상 사용",
    zones: { near: 0, mid: 0, far: 1 },
  },
  progressive: {
    id: "progressive",
    label: "누진다초점",
    tagline: "한 렌즈로 책에서 먼 거리까지",
    description: "책을 보다 고개를 들면 모니터와 먼 거리까지 한 렌즈 안에서 자연스럽게 이어집니다. 노안 초기 또는 거리 전환이 잦은 사용에 적합합니다.",
    bestFor: "40대 이상, 거리 전환이 잦은 사용자",
    zones: { near: 1, mid: 1, far: 1 },
  },
  office: {
    id: "office",
    label: "오피스·중간거리",
    tagline: "실내 작업에 최적화",
    description: "가까움과 중간거리에 시야를 집중한 실내용 렌즈. 모니터·서류 작업이 많고 먼 거리 시야는 덜 필요할 때 적합합니다.",
    bestFor: "사무 환경, 데스크 작업, 학습",
    zones: { near: 1, mid: 1, far: 0 },
  },
};

export const INDEXES: {
  id: IndexId;
  label: string;
  thicknessFactor: number; // 0..1, lower = thinner
  weightFactor: number; // 0..1
  recommendedRange: string;
  priceTier: 1 | 2 | 3 | 4;
  summary: string;
}[] = [
  { id: "1.56", label: "1.56", thicknessFactor: 1.0, weightFactor: 1.0, recommendedRange: "저도수 (~ -2.00D)", priceTier: 1, summary: "기본형, 저도수에 무난한 선택" },
  { id: "1.60", label: "1.60", thicknessFactor: 0.78, weightFactor: 0.86, recommendedRange: "일반 (~ -4.00D)", priceTier: 2, summary: "기본보다 더 얇고 가벼운 일상용 균형" },
  { id: "1.67", label: "1.67", thicknessFactor: 0.55, weightFactor: 0.72, recommendedRange: "고도수 (-4.00 ~ -7.00D)", priceTier: 3, summary: "두께 부담을 크게 줄이는 인기 선택" },
  { id: "1.74", label: "1.74", thicknessFactor: 0.36, weightFactor: 0.62, recommendedRange: "초고도수 (-6.00D 이상)", priceTier: 4, summary: "가장 얇은 프리미엄 옵션" },
];

export const COATINGS: {
  id: CoatingId;
  label: string;
  tagline: string;
  description: string;
  scenario: string;
}[] = [
  { id: "ar", label: "비반사 코팅", tagline: "야간 빛 번짐을 줄여줘요", description: "렌즈 표면 반사를 줄여 야간 운전·실내 조명 환경에서 더 편안한 시야에 도움", scenario: "야간 운전, 실내 조명" },
  { id: "blue", label: "블루라이트 차단", tagline: "디지털 환경에 맞춘 선택", description: "디지털 기기의 청색광 일부를 줄여, 화면 노출이 긴 사용자에게 자주 비교되는 옵션", scenario: "장시간 모니터·스마트폰" },
  { id: "photochromic", label: "변색 렌즈", tagline: "실내 투명, 야외 선글라스", description: "자외선에 반응해 야외에서 어두워지고, 실내에서 다시 투명해지는 렌즈", scenario: "실내외 이동 잦음" },
  { id: "hydrophobic", label: "발수·방오 코팅", tagline: "물기·지문 관리가 쉬워요", description: "물방울이 미끄러지듯 흐르고 지문도 덜 묻어 일상 관리가 편해짐", scenario: "비, 땀, 지문 관리" },
  { id: "scratch", label: "스크래치 보호", tagline: "표면을 단단하게", description: "렌즈 표면 경도를 높여 일상 마찰에서 발생하는 미세 스크래치를 줄여줌", scenario: "활동량이 많은 사용" },
];
