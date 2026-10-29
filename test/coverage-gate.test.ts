import { describe, expect, it } from "vitest";
import { checkCoverage } from "../.github/scripts/coverage-gate.js";

describe("coverage gate", () => {
  it("passes when there is no base coverage", () => {
    expect(checkCoverage(undefined, 40, 0).passed).toBe(true);
  });

  it.each([
    [80, 80, 0],
    [80, 92.5, 0],
    [80, 79.5, 0.5],
  ])("passes for base %d%%, head %d%%, tolerance %d", (base, head, tol) => {
    expect(checkCoverage(base, head, tol).passed).toBe(true);
  });

  it.each([
    [80, 79.99, 0],
    [80, 79, 0.5],
  ])("fails for base %d%%, head %d%%, tolerance %d", (base, head, tol) => {
    expect(checkCoverage(base, head, tol).passed).toBe(false);
  });
});
