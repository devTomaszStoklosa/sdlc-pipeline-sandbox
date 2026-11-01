import { describe, expect, it } from "vitest";
import { addItem, createCart } from "./cart.js";
import { toCsv } from "./csv.js";

const header = "name,unitPrice,quantity,amount";

describe("toCsv", () => {
  it("returns only the header for an empty cart", () => {
    expect(toCsv(createCart())).toBe(header);
  });

  it("writes one row per item with amount = unitPrice * quantity", () => {
    let cart = addItem(createCart(), {
      name: "apple",
      unitPrice: 150,
      quantity: 4,
    });
    cart = addItem(cart, { name: "bread", unitPrice: 799, quantity: 1 });
    expect(toCsv(cart)).toBe(
      [header, "apple,150,4,600", "bread,799,1,799"].join("\r\n"),
    );
  });

  it("quotes a name with a comma", () => {
    const cart = addItem(createCart(), {
      name: "salt, fine",
      unitPrice: 100,
      quantity: 2,
    });
    expect(toCsv(cart)).toBe([header, '"salt, fine",100,2,200'].join("\r\n"));
  });

  it("quotes a name with a quote and doubles the quote", () => {
    const cart = addItem(createCart(), {
      name: 'the "best" tea',
      unitPrice: 100,
      quantity: 1,
    });
    expect(toCsv(cart)).toBe(
      [header, '"the ""best"" tea",100,1,100'].join("\r\n"),
    );
  });

  it("quotes a name with a newline", () => {
    const cart = addItem(createCart(), {
      name: "line1\nline2",
      unitPrice: 100,
      quantity: 1,
    });
    expect(toCsv(cart)).toBe([header, '"line1\nline2",100,1,100'].join("\r\n"));
  });
});
