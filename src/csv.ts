// CSV export of the cart. Escaping is left to papaparse.

import Papa from "papaparse";
import type { Cart } from "./cart.js";

const fields = ["name", "unitPrice", "quantity", "amount"];

export function toCsv(cart: Cart): string {
  const data = cart.items.map((item) => [
    item.name,
    item.unitPrice,
    item.quantity,
    item.unitPrice * item.quantity,
  ]);
  return Papa.unparse({ fields, data });
}
