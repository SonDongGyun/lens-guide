// Contact-lens-specific catalog. Distinct from lib/data.ts because the
// decision axes (재질·교체주기·착용 패턴) don't overlap with the
// eyeglass wizard. Keeping this separate avoids a god-catalog and lets
// each domain evolve without coupling.

export type WearPatternId =
  | "daily_long"
  | "daily_short"
  | "weekly"
  | "occasional";

export type CorrectionTypeId =
  | "sphere"
  | "toric"
  | "multifocal"
  | "cosmetic_first";

export type ContactDiscomfortId =
  | "dryness"
  | "redness"
  | "foreign_body"
  | "blurry"
  | "allergy"
  | "protein";

export type MaterialId = "hydrogel" | "silicone_hydrogel";
export type ReplacementId = "daily" | "biweekly" | "monthly";
export type CosmeticEffectId = "clear" | "natural" | "circle";

export const WEAR_PATTERNS: {
  id: WearPatternId;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  { id: "daily_long", label: "거의 매일 8시간 이상", desc: "출근·등교 등 풀데이 착용", emoji: "🌅" },
  { id: "daily_short", label: "매일 4–8시간", desc: "오후 외출·수업 정도", emoji: "🕓" },
  { id: "weekly", label: "주 2–3회", desc: "특정 활동·운동 시", emoji: "🎯" },
  { id: "occasional", label: "가끔·이벤트만", desc: "여행·행사 등 비정기", emoji: "✨" },
];

export const CORRECTION_TYPES: {
  id: CorrectionTypeId;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  { id: "sphere", label: "근시·원시 (구면)", desc: "난시·노안 없는 일반 도수", emoji: "👁️" },
  { id: "toric", label: "난시 (토릭)", desc: "난시축 보정이 필요해요", emoji: "🔁" },
  { id: "multifocal", label: "노안 (멀티포컬)", desc: "원·근거리 동시 보정", emoji: "🔭" },
  { id: "cosmetic_first", label: "미용 목적 우선", desc: "시력 교정보다 색상·이미지", emoji: "🌈" },
];

export const CONTACT_DISCOMFORTS: {
  id: ContactDiscomfortId;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  { id: "dryness", label: "건조감", desc: "오후가 되면 뻑뻑해요", emoji: "🏜️" },
  { id: "redness", label: "충혈", desc: "눈이 자주 빨개져요", emoji: "🔴" },
  { id: "foreign_body", label: "이물감", desc: "렌즈가 눈에 걸리는 느낌", emoji: "💢" },
  { id: "blurry", label: "시야 흐림", desc: "착용 중 또렷하지 않아요", emoji: "🌫️" },
  { id: "allergy", label: "가려움·알러지", desc: "꽃가루·먼지에 민감", emoji: "🤧" },
  { id: "protein", label: "단백질 침착 우려", desc: "오래 쓰면 뿌예져요", emoji: "🧪" },
];

export const MATERIALS: Record<
  MaterialId,
  {
    id: MaterialId;
    label: string;
    tagline: string;
    description: string;
    oxygenStars: number; // 1..5 — visual gauge for relative oxygen permeability
    waterStars: number; // 1..5 — initial wettability (high water content)
    comfortStars: number; // 1..5 — long-wear comfort
    bestFor: string;
  }
> = {
  hydrogel: {
    id: "hydrogel",
    label: "하이드로겔",
    tagline: "함수율이 높아 처음 착용감이 부드러워요",
    description:
      "전통 재질로 함수율이 높아 착용 직후 촉촉한 느낌이 강합니다. 다만 산소투과도가 낮아 장시간 착용에는 부담이 될 수 있어요.",
    oxygenStars: 2,
    waterStars: 5,
    comfortStars: 3,
    bestFor: "단시간·가끔 착용, 부드러운 첫 느낌이 우선일 때",
  },
  silicone_hydrogel: {
    id: "silicone_hydrogel",
    label: "실리콘 하이드로겔",
    tagline: "산소투과도가 높아 장시간 착용에도 안전",
    description:
      "실리콘이 더해져 산소투과도가 크게 높아진 현대 재질입니다. 함수율은 약간 낮지만 표면 처리 기술로 건조감을 보완했고, 풀데이 착용에 가장 권장돼요.",
    oxygenStars: 5,
    waterStars: 3,
    comfortStars: 5,
    bestFor: "매일 8시간 이상, 모니터·에어컨 환경",
  },
};

export const REPLACEMENTS: Record<
  ReplacementId,
  {
    id: ReplacementId;
    label: string;
    tagline: string;
    description: string;
    hygieneStars: number; // 1..5
    costStars: number; // 1..5 (higher = more expensive)
    convenienceStars: number; // 1..5
    bestFor: string;
  }
> = {
  daily: {
    id: "daily",
    label: "1일 (일회용)",
    tagline: "매일 새 렌즈, 관리 불필요",
    description:
      "착용 후 그날 폐기. 세척·보관액·렌즈 케이스가 필요 없어 가장 위생적이고, 단백질 침착 걱정도 없어요. 단가는 가장 높습니다.",
    hygieneStars: 5,
    costStars: 4,
    convenienceStars: 5,
    bestFor: "건조감·알러지 우려, 위생을 가장 중시",
  },
  biweekly: {
    id: "biweekly",
    label: "2주용",
    tagline: "위생과 비용의 균형",
    description:
      "세척·소독 후 14일 사용. 단백질 침착이 누적되기 시작하지만 정기 교체로 통제 가능합니다. 가장 보편적인 선택이에요.",
    hygieneStars: 3,
    costStars: 2,
    convenienceStars: 3,
    bestFor: "매일 4–8시간 정도, 평균적 사용",
  },
  monthly: {
    id: "monthly",
    label: "1개월용",
    tagline: "장기 사용으로 단가 절감",
    description:
      "한 쌍을 30일 사용. 비용이 가장 낮지만 단백질·지방 침착이 누적되어 후반부에는 시야와 착용감이 떨어질 수 있어요.",
    hygieneStars: 2,
    costStars: 1,
    convenienceStars: 3,
    bestFor: "관리에 익숙하고 비용을 낮추고 싶을 때",
  },
};

export const COSMETIC_EFFECTS: Record<
  CosmeticEffectId,
  {
    id: CosmeticEffectId;
    label: string;
    desc: string;
    emoji: string;
  }
> = {
  clear: { id: "clear", label: "투명", desc: "시력 교정만, 눈동자 색 그대로", emoji: "💎" },
  natural: { id: "natural", label: "내추럴 컬러", desc: "자연스러운 색감 강조", emoji: "🌰" },
  circle: { id: "circle", label: "서클렌즈", desc: "동공 강조·뚜렷한 인상", emoji: "🎀" },
};
