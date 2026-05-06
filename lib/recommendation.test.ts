import { describe, it, expect } from "vitest";
import { recommend } from "./recommendation";

describe("recommend()", () => {
  it("defaults to single-vision when nothing flags progressive or office", () => {
    const r = recommend({
      purposes: ["driving"],
      discomforts: [],
      primaryConcern: null,
      prescription: -2,
    });
    expect(r.lensType).toBe("single");
  });

  it("picks progressive when near_far_switch is reported", () => {
    const r = recommend({
      purposes: [],
      discomforts: ["near_far_switch"],
      primaryConcern: "near_far_switch",
      prescription: -3,
    });
    expect(r.lensType).toBe("progressive");
  });

  it("picks progressive when the user is curious about it", () => {
    const r = recommend({
      purposes: ["progressive_curious"],
      discomforts: [],
      primaryConcern: null,
      prescription: -1,
    });
    expect(r.lensType).toBe("progressive");
  });

  it("picks office when screen+reading dominate without driving", () => {
    const r = recommend({
      purposes: ["screen", "reading"],
      discomforts: [],
      primaryConcern: null,
      prescription: -2,
    });
    expect(r.lensType).toBe("office");
  });

  it("does NOT pick office when driving is also present", () => {
    const r = recommend({
      purposes: ["screen", "reading", "driving"],
      discomforts: [],
      primaryConcern: null,
      prescription: -2,
    });
    expect(r.lensType).toBe("single");
  });

  it("scales index by prescription magnitude", () => {
    expect(
      recommend({ purposes: [], discomforts: [], primaryConcern: null, prescription: -1 })
        .index
    ).toBe("1.56");
    expect(
      recommend({ purposes: [], discomforts: [], primaryConcern: null, prescription: -3 })
        .index
    ).toBe("1.60");
    expect(
      recommend({ purposes: [], discomforts: [], primaryConcern: null, prescription: -5 })
        .index
    ).toBe("1.67");
    expect(
      recommend({ purposes: [], discomforts: [], primaryConcern: null, prescription: -7 })
        .index
    ).toBe("1.74");
  });

  it("bumps index by one tier when wantsThin is requested", () => {
    const r = recommend({
      purposes: ["lightweight"],
      discomforts: [],
      primaryConcern: null,
      prescription: -1, // baseline 1.56 → cascade lifts to 1.67
    });
    expect(r.index).toBe("1.67");
  });

  it("treats thickness discomfort as wantsThin", () => {
    const r = recommend({
      purposes: [],
      discomforts: ["thickness"],
      primaryConcern: "thickness",
      prescription: -3, // baseline 1.60 → cascade to 1.67
    });
    expect(r.index).toBe("1.67");
  });

  it("always includes AR coating as baseline", () => {
    const r = recommend({
      purposes: [],
      discomforts: [],
      primaryConcern: null,
      prescription: -2,
    });
    expect(r.coatings).toContain("ar");
  });

  it("adds blue-light coating for screen-heavy users", () => {
    const r = recommend({
      purposes: ["screen"],
      discomforts: [],
      primaryConcern: null,
      prescription: -2,
    });
    expect(r.coatings).toContain("blue");
  });

  it("adds photochromic for indoor/outdoor or brightness", () => {
    const r = recommend({
      purposes: ["indoor_outdoor"],
      discomforts: [],
      primaryConcern: null,
      prescription: -2,
    });
    expect(r.coatings).toContain("photochromic");
  });

  it("adds hydrophobic when smudge is reported", () => {
    const r = recommend({
      purposes: [],
      discomforts: ["smudge"],
      primaryConcern: "smudge",
      prescription: -2,
    });
    expect(r.coatings).toContain("hydrophobic");
  });

  it("does not produce duplicate coatings", () => {
    const r = recommend({
      purposes: ["driving", "screen", "outdoor"],
      discomforts: ["night_glare", "eye_fatigue"],
      primaryConcern: "night_glare",
      prescription: -2,
    });
    expect(new Set(r.coatings).size).toBe(r.coatings.length);
  });

  it("emits a brief that mentions lens type and index", () => {
    const r = recommend({
      purposes: ["driving"],
      discomforts: [],
      primaryConcern: null,
      prescription: -3,
    });
    expect(r.brief).toContain("단초점");
    expect(r.brief).toContain("1.60");
  });

  it("caps reasons at 4 entries", () => {
    const r = recommend({
      purposes: ["screen", "driving", "outdoor", "lightweight", "indoor_outdoor"],
      discomforts: ["night_glare", "eye_fatigue", "smudge", "brightness"],
      primaryConcern: "thickness",
      prescription: -5,
    });
    expect(r.reasons.length).toBeLessThanOrEqual(4);
  });

  it("primary concern reasons are placed first", () => {
    const r = recommend({
      purposes: [],
      discomforts: ["thickness"],
      primaryConcern: "thickness",
      prescription: -3,
    });
    expect(r.reasons[0]).toContain("두께");
  });
});
