import { describe, expect, it } from "vitest";
import { shippingCost } from "./shipping.js";

describe("shippingCost", () => {
  it("is free for a large standard order", () => {
    expect(shippingCost(20000, false, false)).toBe(0);
  });

  it("adds a surcharge for a small order", () => {
    expect(shippingCost(1000, false, false)).toBe(2000);
  });

  it("charges express and abroad with the surcharge", () => {
    expect(shippingCost(20000, true, true)).toBe(5500);
  });

  it("charges a medium domestic order without a surcharge", () => {
    expect(shippingCost(10000, false, false)).toBe(1500);
  });
});
