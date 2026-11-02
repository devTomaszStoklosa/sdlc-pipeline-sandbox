// Shipping cost in minor currency units. Probe for the complexity threshold
// of the gates (pipeline issue #67): the function has cyclomatic complexity 7.

export function shippingCost(
  subtotal: number,
  express: boolean,
  abroad: boolean,
): number {
  if (subtotal >= 20000 && !express) {
    return 0;
  }
  let cost = 1500;
  if (express) {
    cost += 1000;
  }
  if (abroad) {
    cost *= 2;
  }
  if (subtotal < 5000 || cost > 4000) {
    cost += 500;
  }
  return cost;
}
