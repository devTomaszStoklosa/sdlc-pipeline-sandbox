import { describe, expect, it } from "vitest";
import {
  addItem,
  applyDiscount,
  createCart,
  hasItem,
  itemCount,
  mostExpensiveItem,
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

  it("finds an item that is in the cart", () => {
    const cart = addItem(addItem(createCart(), apple), bread);

    expect(hasItem(cart, "bread")).toBe(true);
  });

  it("does not find an item that is not in the cart", () => {
    const cart = addItem(createCart(), bread);

    expect(hasItem(cart, "apple")).toBe(false);
  });

  it("does not find any item in an empty cart", () => {
    expect(hasItem(createCart(), "apple")).toBe(false);
  });

  it("finds a name that appears more than once", () => {
    const cart = addItem(addItem(createCart(), apple), apple);

    expect(hasItem(cart, "apple")).toBe(true);
  });

  it("compares names case-sensitively", () => {
    const cart = addItem(createCart(), apple);

    expect(hasItem(cart, "Apple")).toBe(false);
  });

  it("counts no pieces in an empty cart", () => {
    expect(itemCount(createCart())).toBe(0);
  });

  it("counts the pieces of all items", () => {
    const cart = addItem(addItem(createCart(), apple), bread);

    expect(itemCount(cart)).toBe(5);
  });

  it("counts pieces regardless of the discount", () => {
    const cart = applyDiscount(addItem(createCart(), apple), 50);

    expect(itemCount(cart)).toBe(4);
  });

  it("finds the item with the highest unit price", () => {
    const cart = addItem(addItem(createCart(), apple), bread);

    expect(mostExpensiveItem(cart)).toBe(bread);
  });

  it("returns the first item when the highest unit price is tied", () => {
    const twin: CartItem = { ...bread, name: "twin" };
    const cart = addItem(addItem(addItem(createCart(), apple), bread), twin);

    expect(mostExpensiveItem(cart)).toBe(bread);
  });

  it("returns undefined for the most expensive item of an empty cart", () => {
    expect(mostExpensiveItem(createCart())).toBeUndefined();
  });

  it("sums unit prices times quantities", () => {
    const cart = addItem(addItem(createCart(), apple), bread);

    expect(subtotal(cart)).toBe(1399);
    expect(total(cart)).toBe(1399);
  });

  it("rejects a subtotal when an item's price times quantity is unsafe", () => {
    const cart = addItem(createCart(), {
      name: "a",
      unitPrice: Number.MAX_SAFE_INTEGER,
      quantity: 2,
    });

    expect(() => subtotal(cart)).toThrow(RangeError);
    expect(() => subtotal(cart)).toThrow('item "a"');
    expect(() => total(cart)).toThrow(RangeError);
  });

  it("rejects a subtotal when the sum of items is unsafe", () => {
    const cart = addItem(
      addItem(createCart(), {
        name: "a",
        unitPrice: Number.MAX_SAFE_INTEGER,
        quantity: 1,
      }),
      { name: "b", unitPrice: 2, quantity: 1 },
    );

    expect(() => subtotal(cart)).toThrow(RangeError);
    expect(() => subtotal(cart)).toThrow("cart subtotal");
    expect(() => total(cart)).toThrow(RangeError);
  });

  it("accepts a subtotal equal to the largest safe integer", () => {
    const cart = addItem(
      addItem(createCart(), {
        name: "a",
        unitPrice: Number.MAX_SAFE_INTEGER - 2,
        quantity: 1,
      }),
      { name: "b", unitPrice: 2, quantity: 1 },
    );

    expect(subtotal(cart)).toBe(Number.MAX_SAFE_INTEGER);
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
