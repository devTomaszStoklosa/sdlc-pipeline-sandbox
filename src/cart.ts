// Shopping cart. Amounts are integers in minor currency units (e.g. grosze),
// so totals never suffer from floating-point rounding.

import { z } from "zod";

export interface CartItem {
  readonly name: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

export interface Cart {
  readonly items: readonly CartItem[];
  readonly discountPercent: number;
}

const unitPriceError = "Unit price must be a non-negative integer.";
const quantityError = "Quantity must be a positive integer.";

// Each field fails with one readable message, whichever check it breaks.
const cartItemSchema = z.object({
  unitPrice: z.int(unitPriceError).min(0, unitPriceError),
  quantity: z.int(quantityError).min(1, quantityError),
});

export function createCart(): Cart {
  return { items: [], discountPercent: 0 };
}

export function addItem(cart: Cart, item: CartItem): Cart {
  const result = cartItemSchema.safeParse(item);
  if (!result.success) {
    throw new RangeError(result.error.issues[0]?.message);
  }
  return { ...cart, items: [...cart.items, item] };
}

export function applyDiscount(cart: Cart, percent: number): Cart {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new RangeError("Discount must be between 0 and 100 percent.");
  }
  return { ...cart, discountPercent: percent };
}

export function subtotal(cart: Cart): number {
  return cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
}

export function total(cart: Cart): number {
  const amount = subtotal(cart);
  return amount - Math.round((amount * cart.discountPercent) / 100);
}
