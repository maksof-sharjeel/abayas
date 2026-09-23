import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deliveredProfit, productProfit, validMoney } from './profit';
import { productData, publicProduct } from './product-data';
test('400 cost and 600 selling gives 200 gross profit and 33.33% margin', () => {
  assert.deepEqual(productProfit(600, 400), { profit: 200, margin: 33.33 });
  assert.deepEqual(productProfit(600, 400, 3), { profit: 600, margin: 33.33 });
});
test('unknown cost is distinct from zero and losses are retained', () => {
  assert.deepEqual(productProfit(600, null), { profit: null, margin: null });
  assert.deepEqual(productProfit(600, 0), { profit: 600, margin: 100 });
  assert.deepEqual(productProfit(0, 400), { profit: -400, margin: null });
  assert.equal(productProfit(300, 400).profit, -100);
});
test('money validation rejects invalid values and fractional paisas', () => {
  for (const value of [-1, Infinity, NaN, '400', 1.001]) assert.equal(validMoney(value), false);
  for (const value of [0, 400, 400.25]) assert.equal(validMoney(value), true);
});
test('public products never include cost; only whitelisted product fields are writable', () => {
  assert.deepEqual(publicProduct({ id: 'p1', price: 600, costPrice: 400 }), { id: 'p1', price: 600 });
  const base = { name: 'Abaya', description: '', price: 600, category: 'Minimal', fabric: 'Nida', images: [], sizes: [] };
  assert.equal(productData({ ...base, costPrice: null }).costPrice, null);
  assert.equal(productData({ ...base, costPrice: 0 }).costPrice, 0);
  assert.equal('costPrice' in productData(base), false);
  assert.equal('orders' in productData({ ...base, orders: { deleteMany: {} } }), false);
  assert.throws(() => productData({ ...base, costPrice: -1 }));
});

test('dashboard profit uses delivered snapshots, quantity and weighted margin only', () => {
  const orders = [
    { status: 'Delivered', itemPrice: 600, itemCost: 400, quantity: 2 },
    { status: 'Delivered', itemPrice: 1000, itemCost: 900, quantity: 1 },
    { status: 'Pending', itemPrice: 600, itemCost: 400, quantity: 20 },
    { status: 'Cancelled', itemPrice: 600, itemCost: 400, quantity: 20 },
    { status: 'Returned', itemPrice: 600, itemCost: 400, quantity: 20 },
    { status: 'Delivered', itemPrice: 600, itemCost: null, quantity: 1 },
  ];
  assert.deepEqual(deliveredProfit(orders), { profit: 500, margin: 22.73, included: 2, missing: 1 });
});
test('dashboard handles empty, entirely unknown, zero cost and loss-making orders', () => {
  assert.deepEqual(deliveredProfit([]), { profit: 0, margin: null, included: 0, missing: 0 });
  const order = { status: 'Delivered', itemPrice: 600, itemCost: null, quantity: 1 };
  assert.equal(deliveredProfit([order]).profit, null);
  assert.equal(deliveredProfit([{ ...order, itemCost: 0 }]).profit, 600);
  assert.equal(deliveredProfit([{ ...order, itemCost: 700 }]).profit, -100);
});
