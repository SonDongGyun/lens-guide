import { describe, expect, it } from "vitest";
import { decidePopAction, decideSyncAction } from "./useKioskGuards";

describe("decidePopAction", () => {
  it("returns consume-guard whenever popGuard is active, regardless of screen", () => {
    expect(decidePopAction(true, true)).toBe("consume-guard");
    expect(decidePopAction(true, false)).toBe("consume-guard");
  });

  it("returns exit-welcome on welcome with no popGuard, so back exits the page", () => {
    expect(decidePopAction(false, true)).toBe("exit-welcome");
  });

  it("returns go-prev on non-welcome screens with no popGuard", () => {
    expect(decidePopAction(false, false)).toBe("go-prev");
  });
});

describe("decideSyncAction", () => {
  // Welcome carries zero sentinels.
  it("welcome with no leftover sentinel is a no-op", () => {
    expect(decideSyncAction(true, false, false)).toBe("no-op");
    // The history-state flag shouldn't matter on welcome — we don't
    // own anything here either way.
    expect(decideSyncAction(true, false, true)).toBe("no-op");
  });

  it("welcome with a leftover sentinel consumes it", () => {
    // Footer-back from non-welcome lands here: the entry pushed at
    // the previous step is still on the stack and must be popped.
    expect(decideSyncAction(true, true, false)).toBe("consume-leftover");
  });

  // Non-welcome carries exactly one sentinel.
  it("non-welcome with sentinel already locally tracked is a no-op", () => {
    expect(decideSyncAction(false, true, true)).toBe("no-op");
    expect(decideSyncAction(false, true, false)).toBe("no-op");
  });

  it("non-welcome with the history entry already a sentinel just claims it", () => {
    // Page refresh preserves our pushState entry; we don't push another.
    expect(decideSyncAction(false, false, true)).toBe("claim-existing");
  });

  it("non-welcome with no sentinel and no claimable history pushes a new one", () => {
    expect(decideSyncAction(false, false, false)).toBe("push-new");
  });
});
