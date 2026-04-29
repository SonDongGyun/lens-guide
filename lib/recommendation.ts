import type {
  PurposeId,
  DiscomfortId,
  LensTypeId,
  IndexId,
  CoatingId,
} from "./data";

export interface Recommendation {
  lensType: LensTypeId;
  index: IndexId;
  coatings: CoatingId[];
  reasons: string[];
  brief: string; // staff brief one-liner
  highlights: { lens: string; index: string; coating: string };
}

export function recommend({
  purposes,
  discomforts,
  primaryConcern,
  prescription,
}: {
  purposes: PurposeId[];
  discomforts: DiscomfortId[];
  primaryConcern: DiscomfortId | null;
  prescription: number;
}): Recommendation {
  const reasons: string[] = [];
  const has = (arr: string[], id: string) => arr.includes(id);

  // -------- Lens type --------
  let lensType: LensTypeId = "single";
  if (has(purposes, "progressive_curious") || has(discomforts, "near_far_switch")) {
    lensType = "progressive";
    reasons.push("가까움-먼 거리 전환이 잦거나 다초점 관심이 확인되어 누진다초점 비교를 권장합니다.");
  } else if (has(purposes, "screen") && has(purposes, "reading") && !has(purposes, "driving")) {
    lensType = "office";
    reasons.push("실내 모니터·서류 작업 비중이 커서 중간거리 시야를 강화한 오피스 렌즈도 비교해볼 가치가 있습니다.");
  } else {
    reasons.push("뚜렷한 단일 거리 사용이 많아 단초점 렌즈가 가장 자연스러운 선택입니다.");
  }

  // -------- Index --------
  const absRx = Math.abs(prescription);
  let index: IndexId = "1.60";
  const wantsThin =
    has(purposes, "lightweight") || has(discomforts, "thickness");

  if (absRx >= 6) index = "1.74";
  else if (absRx >= 4) index = "1.67";
  else if (absRx >= 2) index = "1.60";
  else index = "1.56";

  if (wantsThin && index === "1.56") index = "1.60";
  if (wantsThin && index === "1.60") index = "1.67";

  if (wantsThin) {
    reasons.push(`두께·무게 부담을 줄이는 게 중요해, 같은 도수에서 더 얇은 ${index} 압축률을 우선 비교 대상으로 잡았습니다.`);
  } else {
    reasons.push(`현재 입력 도수(${prescription.toFixed(2)}D) 기준으로 ${index} 압축률이 두께·가격 균형이 좋습니다.`);
  }

  // -------- Coatings --------
  const coatings = new Set<CoatingId>();
  // AR is almost always recommended baseline
  coatings.add("ar");

  if (has(discomforts, "night_glare") || has(purposes, "driving")) {
    coatings.add("ar");
    reasons.push("야간 운전·반사 불편이 확인되어 비반사(AR) 코팅을 기본으로 권장합니다.");
  }
  if (has(purposes, "screen") || has(discomforts, "eye_fatigue")) {
    coatings.add("blue");
    reasons.push("화면 사용 시간이 길어 블루라이트 차단을 비교해볼 만합니다.");
  }
  if (has(purposes, "indoor_outdoor") || has(discomforts, "brightness") || has(purposes, "outdoor")) {
    coatings.add("photochromic");
    reasons.push("실내외 이동·야외 활동이 많은 패턴이라 변색 렌즈가 편의성 측면에서 의미있을 수 있습니다.");
  }
  if (has(discomforts, "smudge")) {
    coatings.add("hydrophobic");
    reasons.push("지문·물때 관리 스트레스가 있다면 발수·방오 코팅이 일상 관리 부담을 줄여줍니다.");
  }

  // primary concern emphasis
  if (primaryConcern === "thickness") {
    reasons.unshift("가장 큰 고민이 \"두께·무게\"이므로, 압축률 비교가 상담의 출발점입니다.");
  } else if (primaryConcern === "night_glare") {
    reasons.unshift("가장 큰 고민이 \"야간 빛 반사\"이므로 비반사 코팅 체감을 먼저 확인하시면 좋습니다.");
  } else if (primaryConcern === "eye_fatigue") {
    reasons.unshift("가장 큰 고민이 \"화면 피로\"이므로 블루라이트 차단 비교를 우선 살펴보세요.");
  } else if (primaryConcern === "near_far_switch") {
    reasons.unshift("가장 큰 고민이 \"거리 전환\"이므로 누진 시야 체험을 먼저 진행해보시는 걸 권합니다.");
  }

  const lensLabel: Record<LensTypeId, string> = {
    single: "단초점",
    progressive: "누진다초점",
    office: "오피스 렌즈",
  };

  const coatingList = Array.from(coatings);
  const coatingLabel: Record<CoatingId, string> = {
    ar: "비반사",
    blue: "블루라이트",
    photochromic: "변색",
    hydrophobic: "발수·방오",
    scratch: "스크래치 보호",
  };

  const brief = `${lensLabel[lensType]} · ${index} · ${coatingList.map((c) => coatingLabel[c]).join("+")}`;

  return {
    lensType,
    index,
    coatings: coatingList,
    reasons: reasons.slice(0, 4),
    brief,
    highlights: {
      lens: lensLabel[lensType],
      index,
      coating: coatingList.map((c) => coatingLabel[c]).join(" + "),
    },
  };
}
