// CSV export of the cart. Quoting and escaping are left to papaparse.

import Papa from "papaparse";
import type { Cart } from "./cart.js";

const fields = ["name", "unitPrice", "quantity", "amount"];

export function toCsv(cart: Cart): string {
  const data = cart.items.map(({ name, unitPrice, quantity }) => [
    name,
    unitPrice,
    quantity,
    unitPrice * quantity,
  ]);
  // With no rows papaparse ends the header with a line break; the header
  // alone is a single row, so it is written as one.
  return data.length === 0
    ? Papa.unparse([fields])
    : Papa.unparse({ fields, data });
}
