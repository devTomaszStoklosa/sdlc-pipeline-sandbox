// Shopping cart. Amounts are integers in minor currency units (e.g. grosze),
// so totals never suffer from floating-point rounding.

export interface CartItem {
  readonly name: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

export interface Cart {
  readonly items: readonly CartItem[];
  readonly discountPercent: number;
}

export function createCart(): Cart {
  return { items: [], discountPercent: 0 };
}

export function addItem(cart: Cart, item: CartItem): Cart {
  if (!Number.isInteger(item.unitPrice) || item.unitPrice < 0) {
    throw new RangeError("Unit price must be a non-negative integer.");
  }
  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    throw new RangeError("Quantity must be a positive integer.");
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

export function itemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function total(cart: Cart): number {
  const amount = subtotal(cart);
  return amount - Math.round((amount * cart.discountPercent) / 100);
}
