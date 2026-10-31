import { describe, expect, it } from "vitest";
import {
  addItem,
  applyDiscount,
  createCart,
  removeItem,
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

  it("removes every item with the given name", () => {
    const cart = addItem(addItem(addItem(createCart(), apple), bread), apple);

    expect(removeItem(cart, "apple").items).toEqual([bread]);
  });

  it("keeps the discount and the original cart when removing an item", () => {
    const cart = applyDiscount(
      addItem(addItem(createCart(), apple), bread),
      10,
    );
    const removed = removeItem(cart, "bread");

    expect(removed.discountPercent).toBe(10);
    expect(cart.items).toEqual([apple, bread]);
  });

  it("rejects removing a name that is not in the cart", () => {
    const cart = addItem(createCart(), bread);

    expect(() => removeItem(cart, "apple")).toThrow(RangeError);
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
    ["an empty name", { ...apple, name: "" }],
    ["a whitespace-only name", { ...apple, name: " \t " }],
    ["a fractional unit price", { ...apple, unitPrice: 1.5 }],
    ["a negative unit price", { ...apple, unitPrice: -1 }],
    ["a fractional quantity", { ...apple, quantity: 0.5 }],
    ["a zero quantity", { ...apple, quantity: 0 }],
  ])("rejects an item with %s", (_reason, item) => {
    expect(() => addItem(createCart(), item)).toThrow(RangeError);
  });

  it.each([
    ["Item name must not be empty.", { ...apple, name: "  " }],
    ["Unit price must be a non-negative integer.", { ...apple, unitPrice: -1 }],
    ["Quantity must be a positive integer.", { ...apple, quantity: 0 }],
  ])("explains the rejection: %s", (message, item) => {
    expect(() => addItem(createCart(), item)).toThrow(message);
  });

  it.each([-1, 101, Number.NaN])("rejects a discount of %d percent", (pct) => {
    expect(() => applyDiscount(createCart(), pct)).toThrow(RangeError);
  });
});
