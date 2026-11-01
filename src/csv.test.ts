import { describe, expect, it } from "vitest";
import { addItem, createCart } from "./cart.js";
import { toCsv } from "./csv.js";

const header = "name,unitPrice,quantity,amount";

describe("toCsv", () => {
  it("returns only the header for an empty cart", () => {
    expect(toCsv(createCart())).toBe(header);
  });

  it("writes one row per item with amount = unitPrice * quantity", () => {
    let cart = createCart();
    cart = addItem(cart, { name: "Apple", unitPrice: 250, quantity: 3 });
    cart = addItem(cart, { name: "Pear", unitPrice: 100, quantity: 1 });
    expect(toCsv(cart)).toBe(`${header}\r\nApple,250,3,750\r\nPear,100,1,100`);
  });

  it("quotes a name with a comma", () => {
    const cart = addItem(createCart(), {
      name: "Salt, fine",
      unitPrice: 5,
      quantity: 2,
    });
    expect(toCsv(cart)).toBe(`${header}\r\n"Salt, fine",5,2,10`);
  });

  it("quotes a name with a quote and doubles the quote", () => {
    const cart = addItem(createCart(), {
      name: 'The "Big" one',
      unitPrice: 5,
      quantity: 2,
    });
    expect(toCsv(cart)).toBe(`${header}\r\n"The ""Big"" one",5,2,10`);
  });

  it("quotes a name with a newline", () => {
    const cart = addItem(createCart(), {
      name: "Line1\nLine2",
      unitPrice: 5,
      quantity: 2,
    });
    expect(toCsv(cart)).toBe(`${header}\r\n"Line1\nLine2",5,2,10`);
  });
});
