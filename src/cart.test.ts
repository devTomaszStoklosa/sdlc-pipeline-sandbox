import { describe, expect, it } from "vitest";
import {
  addItem,
  applyDiscount,
  createCart,
  subtotal,
  total,
  type CartItem,
} from "./cart.js";

const apple: CartItem = { name: "apple", unitPrice: 150, quantity: 4 };
const bread: CartItem = { name: "bread", unitPrice: 799, quantity: 1 };

describe("cart", () => {
  it("starts empty", () => {
    const cart = createCart();

    expect(cart.items).toEqual([]);
    expect(total(cart)).toBe(0);
  });

  it("adds items without changing the original cart", () => {
    const empty = createCart();
    const cart = addItem(empty, apple);

    expect(cart.items).toEqual([apple]);
    expect(empty.items).toEqual([]);
  });

  it("sums unit prices times quantities", () => {
    const cart = addItem(addItem(createCart(), apple), bread);

    expect(subtotal(cart)).toBe(1399);
    expect(total(cart)).toBe(1399);
  });

  it("applies a percentage discount rounded to the nearest unit", () => {
    const cart = applyDiscount(addItem(createCart(), bread), 15);

    expect(total(cart)).toBe(679);
  });

  it.each([
    ["a fractional unit price", { ...apple, unitPrice: 1.5 }],
    ["a negative unit price", { ...apple, unitPrice: -1 }],
    ["a fractional quantity", { ...apple, quantity: 0.5 }],
    ["a zero quantity", { ...apple, quantity: 0 }],
  ])("rejects an item with %s", (_reason, item) => {
    expect(() => addItem(createCart(), item)).toThrow(RangeError);
  });

  it.each([-1, 101, Number.NaN])("rejects a discount of %d percent", (pct) => {
    expect(() => applyDiscount(createCart(), pct)).toThrow(RangeError);
  });
});
