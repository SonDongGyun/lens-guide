import type {
  ContactDiscomfortId,
  CorrectionTypeId,
  MaterialId,
  ReplacementId,
  WearPatternId,
} from "./data";

export interface ContactsRecommendation {
  material: MaterialId;
  replacement: ReplacementId;
  notes: string[];
  visitChecklist: string[];
}

interface Input {
  wearPattern: WearPatternId | null;
  correctionType: CorrectionTypeId | null;
  discomforts: ContactDiscomfortId[];
  primaryDiscomfort: ContactDiscomfortId | null;
}

// Pure function — easy to unit-test once the screens land. Conservative
// by design: when inputs are null/empty, fall back to the safest
// defaults (실리콘하이드로겔 + 1일) rather than guessing a specific
// model. The wizard never recommends an actual brand — just material
// class and replacement schedule, which the staff narrows down at the
// store with measured BC/DIA/도수.
export function recommendContacts(input: Input): ContactsRecommendation {
  const material = pickMaterial(input);
  const replacement = pickReplacement(input);
  const notes = buildNotes(input, material);
  const visitChecklist = buildChecklist(input);
  return { material, replacement, notes, visitChecklist };
}

function pickMaterial(input: Input): MaterialId {
  // Long daily wear or any oxygen-related concern → silicone hydrogel.
  // Occasional/short wear with no oxygen flags → either works, prefer
  // hydrogel for the slightly softer initial feel.
  if (
    input.wearPattern === "daily_long" ||
    input.discomforts.includes("redness") ||
    input.discomforts.includes("blurry")
  ) {
    return "silicone_hydrogel";
  }
  if (input.wearPattern === "occasional") return "hydrogel";
  return "silicone_hydrogel";
}

function pickReplacement(input: Input): ReplacementId {
  // Hygiene-sensitive concerns push toward 1-day.
  const sensitive = input.discomforts.some(
    (d) => d === "dryness" || d === "allergy" || d === "protein"
  );
  if (sensitive) return "daily";
  if (input.wearPattern === "occasional" || input.wearPattern === "weekly") {
    return "daily";
  }
  return "biweekly";
}

function buildNotes(input: Input, material: MaterialId): string[] {
  const notes: string[] = [];
  if (input.correctionType === "toric") {
    notes.push(
      "난시 보정 렌즈는 안축 안정화 디자인이 핵심이에요. 매장에서 회전 안정성 측정을 받으세요."
    );
  }
  if (input.correctionType === "multifocal") {
    notes.push(
      "노안 보정은 가산도수와 디자인이 다양해요. 매장에서 1–2주 적응 트라이얼을 추천드려요."
    );
  }
  if (
    material === "silicone_hydrogel" &&
    input.discomforts.includes("dryness")
  ) {
    notes.push(
      "실리콘하이드로겔은 산소투과는 좋지만 표면 처리에 따라 건조감 차이가 있어요. 인공눈물 병행이 도움이 됩니다."
    );
  }
  if (input.correctionType === "cosmetic_first") {
    notes.push(
      "미용 렌즈는 색상 인쇄 위치와 산소투과도가 모델별로 차이가 커요. 장시간보다는 외출용으로 권장됩니다."
    );
  }
  if (input.wearPattern === "daily_long" && !notes.length) {
    notes.push(
      "장시간 착용 시 4–6시간마다 인공눈물로 표면을 적셔주면 건조감을 늦출 수 있어요."
    );
  }
  return notes;
}

function buildChecklist(input: Input): string[] {
  const checklist = [
    "베이스 커브(BC)·직경(DIA) 측정",
    "정확한 구면 도수(SPH) 확인",
  ];
  if (input.correctionType === "toric") {
    checklist.push("난시 도수(CYL)와 축(AXIS) 측정");
  }
  if (input.correctionType === "multifocal") {
    checklist.push("가산도수(ADD) 결정 + 적응 트라이얼");
  }
  checklist.push("눈물량·각막 상태 점검");
  return checklist;
}
