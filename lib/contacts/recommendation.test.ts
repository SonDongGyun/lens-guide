import { describe, it, expect } from "vitest";
import { recommendContacts } from "./recommendation";

type Input = Parameters<typeof recommendContacts>[0];

const empty: Input = {
  wearPattern: null,
  correctionType: null,
  discomforts: [],
  primaryDiscomfort: null,
};

describe("recommendContacts()", () => {
  it("falls back to silicone_hydrogel + biweekly when nothing is filled", () => {
    const r = recommendContacts({ ...empty });
    expect(r.material).toBe("silicone_hydrogel");
    expect(r.replacement).toBe("biweekly");
  });

  it("picks silicone_hydrogel for long daily wear", () => {
    const r = recommendContacts({ ...empty, wearPattern: "daily_long" });
    expect(r.material).toBe("silicone_hydrogel");
  });

  it("picks hydrogel only for occasional wearers", () => {
    const r = recommendContacts({ ...empty, wearPattern: "occasional" });
    expect(r.material).toBe("hydrogel");
  });

  it("escalates to silicone_hydrogel when redness is reported", () => {
    const r = recommendContacts({
      ...empty,
      wearPattern: "occasional",
      discomforts: ["redness"],
    });
    expect(r.material).toBe("silicone_hydrogel");
  });

  it("escalates to silicone_hydrogel when blurry is reported", () => {
    const r = recommendContacts({
      ...empty,
      wearPattern: "occasional",
      discomforts: ["blurry"],
    });
    expect(r.material).toBe("silicone_hydrogel");
  });

  it("pushes hygiene-sensitive concerns toward daily replacement", () => {
    const dryness = recommendContacts({ ...empty, discomforts: ["dryness"] });
    expect(dryness.replacement).toBe("daily");

    const allergy = recommendContacts({ ...empty, discomforts: ["allergy"] });
    expect(allergy.replacement).toBe("daily");

    const protein = recommendContacts({ ...empty, discomforts: ["protein"] });
    expect(protein.replacement).toBe("daily");
  });

  it("recommends daily for occasional/weekly wearers regardless of concerns", () => {
    expect(
      recommendContacts({ ...empty, wearPattern: "occasional" }).replacement
    ).toBe("daily");
    expect(
      recommendContacts({ ...empty, wearPattern: "weekly" }).replacement
    ).toBe("daily");
  });

  it("emits a toric note when correction is toric", () => {
    const r = recommendContacts({ ...empty, correctionType: "toric" });
    expect(r.notes.some((n) => n.includes("난시"))).toBe(true);
  });

  it("emits a multifocal note for noan correction", () => {
    const r = recommendContacts({ ...empty, correctionType: "multifocal" });
    expect(r.notes.some((n) => n.includes("가산도수"))).toBe(true);
  });

  it("flags cosmetic-first usage", () => {
    const r = recommendContacts({
      ...empty,
      correctionType: "cosmetic_first",
    });
    expect(r.notes.some((n) => n.includes("미용"))).toBe(true);
  });

  it("notes 인공눈물 when silicone hydrogel is paired with dryness", () => {
    const r = recommendContacts({
      ...empty,
      wearPattern: "daily_long",
      discomforts: ["dryness"],
      primaryDiscomfort: "dryness",
    });
    expect(r.material).toBe("silicone_hydrogel");
    expect(r.notes.some((n) => n.includes("인공눈물"))).toBe(true);
  });

  it("includes BC and SPH on the visit checklist by default", () => {
    const r = recommendContacts({ ...empty });
    const text = r.visitChecklist.join(" ");
    expect(text).toContain("BC");
    expect(text).toContain("SPH");
  });

  it("adds toric measurements (CYL/AXIS) when correction is toric", () => {
    const r = recommendContacts({ ...empty, correctionType: "toric" });
    const text = r.visitChecklist.join(" ");
    expect(text).toContain("CYL");
    expect(text).toContain("AXIS");
  });

  it("adds ADD when correction is multifocal", () => {
    const r = recommendContacts({ ...empty, correctionType: "multifocal" });
    expect(r.visitChecklist.some((c) => c.includes("ADD"))).toBe(true);
  });

  it("checklist always finishes with eye-condition check", () => {
    const r = recommendContacts({ ...empty });
    expect(r.visitChecklist[r.visitChecklist.length - 1]).toContain("각막");
  });

  it("never returns the same item twice in the checklist", () => {
    const r = recommendContacts({ ...empty, correctionType: "toric" });
    expect(new Set(r.visitChecklist).size).toBe(r.visitChecklist.length);
  });
});
