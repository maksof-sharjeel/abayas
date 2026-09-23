export const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export function validMoney(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1_000_000_000 && Math.abs(value - money(value)) < 0.000001;
}
// Merchandise gross profit only. Delivery is recorded separately, not counted as profit.
export function productProfit(sellingPrice: number, costPrice: number | null, quantity = 1) {
  if (costPrice == null) return { profit: null, margin: null };
  const profit = money((sellingPrice - costPrice) * quantity);
  return { profit, margin: sellingPrice > 0 ? money((sellingPrice - costPrice) / sellingPrice * 100) : null };
}

export interface ProfitSummaryOrder {
  status: string;
  itemPrice: number;
  itemCost: number | null;
  quantity: number;
}

// Realized merchandise gross profit: use historical costs of delivered orders only.
export function deliveredProfit(orders: ProfitSummaryOrder[]) {
  const delivered = orders.filter(order => order.status === 'Delivered');
  const known = delivered.filter(order => order.itemCost != null);
  const missing = delivered.length - known.length;
  const profit = money(known.reduce((sum, order) => sum + productProfit(order.itemPrice, order.itemCost, order.quantity).profit!, 0));
  const sales = money(known.reduce((sum, order) => sum + order.itemPrice * order.quantity, 0));
  return {
    profit: missing > 0 && known.length === 0 ? null : profit,
    margin: sales > 0 ? money(profit / sales * 100) : null,
    included: known.length,
    missing,
  };
}
