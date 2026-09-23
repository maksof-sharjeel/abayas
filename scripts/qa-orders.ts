import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { encode } from 'next-auth/jwt';
import { chromium } from '@playwright/test';
import { productProfit } from '../src/lib/profit';
import { mkdirSync, writeFileSync } from 'node:fs';
loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const base = 'http://localhost:3000';
const marker = '[DEMO QA - safe to delete]';
const checks: string[] = [];
let cookie = '';
async function api(path: string, method = 'GET', body?: unknown, admin = false) {
  const response = await fetch(base + path, { method, headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(admin ? { Cookie: cookie } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = await response.json();
  return { status: response.status, data };
}
async function main() {
  const admin = await prisma.admin.findFirst({ select: { id: true, email: true } });
  assert.ok(admin && process.env.NEXTAUTH_SECRET, 'Existing admin and NEXTAUTH_SECRET required');
  const token = await encode({ token: { id: admin.id, sub: admin.id, email: admin.email }, secret: process.env.NEXTAUTH_SECRET, maxAge: 3600 });
  const cookieName = process.env.NEXTAUTH_URL?.startsWith('https:') ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
  assert.equal(cookieName, 'next-auth.session-token', 'This test script is for the local HTTP dev server');
  cookie = cookieName + '=' + token;
  assert.equal((await api('/api/orders', 'GET', undefined, true)).status, 200);
  checks.push('Authenticated admin access works');
  for (const [path, method] of [['/api/orders', 'GET'], ['/api/inquiries', 'GET'], ['/api/products', 'POST'], ['/api/categories', 'POST'], ['/api/payment-methods', 'POST'], ['/api/settings', 'PUT'], ['/api/delivery-zones', 'POST'], ['/api/orders/not-a-real-id', 'PATCH'], ['/api/orders/not-a-real-id', 'DELETE'], ['/api/products/not-a-real-id', 'PUT'], ['/api/products/not-a-real-id', 'DELETE'], ['/api/categories/not-a-real-id', 'DELETE'], ['/api/payment-methods/not-a-real-id', 'PATCH'], ['/api/payment-methods/not-a-real-id', 'DELETE'], ['/api/delivery-zones/not-a-real-id', 'PATCH'], ['/api/delivery-zones/not-a-real-id', 'DELETE']]) {
    assert.equal((await api(path, method, method === 'GET' ? undefined : {})).status, 401, path + ' must require admin');
  }
  assert.equal((await api('/api/admin/signup', 'POST', {})).status, 403);
  checks.push('16 admin endpoint guards and closed public admin signup');
  const delivery = await api('/api/delivery-zones');
  assert.equal(delivery.status, 200);
  const charge = delivery.data.deliveryCharge;
  assert.equal((await api('/api/delivery-zones', 'POST', { deliveryCharge: -1 }, true)).status, 400);
  assert.deepEqual((await api('/api/delivery-zones')).data, delivery.data);
  checks.push('Invalid delivery charge cannot erase the configured setting');
  const methods = (await api('/api/payment-methods')).data;
  const method = methods.find((item: { isActive: boolean }) => item.isActive);
  assert.ok(method, 'An active payment method is required');
  const productBody = { productCode: 'DEMO-QA-COST', name: 'DEMO QA - Cost 400 Selling 600', description: marker, price: 600, costPrice: 400, category: 'Minimal', fabric: 'Demo fabric', images: [], sizes: ['54'], stockStatus: 'In Stock', featured: false };
  let product = await prisma.product.findUnique({ where: { productCode: productBody.productCode } });
  if (!product) {
    const created = await api('/api/products', 'POST', productBody, true); assert.equal(created.status, 201); product = created.data;
  } else { assert.equal(product.description, marker); assert.equal((await api('/api/products/' + product.id, 'PUT', productBody, true)).status, 200); }
  assert.ok(product);
  const id = product.id;
  let unknown = await prisma.product.findUnique({ where: { productCode: 'DEMO-QA-UNKNOWN' } });
  if (!unknown) {
    const created = await api('/api/products', 'POST', { ...productBody, productCode: 'DEMO-QA-UNKNOWN', name: 'DEMO QA - Cost Not Set', costPrice: null }, true); assert.equal(created.status, 201); unknown = created.data;
  } else { assert.equal(unknown.description, marker); await prisma.product.update({ where: { id: unknown.id }, data: { stockStatus: 'In Stock', costPrice: null } }); }
  assert.ok(unknown);
  const publicProducts = await api('/api/products');
  assert.ok(publicProducts.data.every((p: object) => !('costPrice' in p)));
  assert.ok(!('costPrice' in (await api('/api/products/' + id)).data));
  assert.equal((await api('/api/products/' + id, 'GET', undefined, true)).data.costPrice, 400);
  assert.equal((await api('/api/products/' + id, 'PUT', { ...productBody, costPrice: -1 }, true)).status, 400);
  checks.push('Cost is admin-only; invalid product cost rejected');
  const payload = { customerName: 'DEMO QA Pending', customerPhone: '03000000000', customerAddress: 'Demo test address, not for delivery', customerCity: 'Lahore', productId: id, quantity: 1, size: '54', paymentMethodId: method.id, notes: marker };
  for (const quantity of [0, -1, 1.5, true, 'abc']) assert.equal((await api('/api/orders', 'POST', { ...payload, quantity })).status, 400);
  assert.equal((await api('/api/orders', 'POST', { ...payload, size: '999' })).status, 400);
  assert.equal((await api('/api/orders', 'POST', { ...payload, paymentMethodId: 'missing-method' })).status, 400);
  assert.equal((await api('/api/orders', 'POST', { ...payload, customerName: '  ' })).status, 400);
  checks.push('Invalid quantity, size, payment method and customer details rejected');
  const ids: string[] = [];
  const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  for (let i = 0; i < statuses.length; i++) {
    const name = 'DEMO QA ' + statuses[i];
    let order = await prisma.order.findFirst({ where: { customerName: name, notes: marker } });
    if (!order) {
      const created = await api('/api/orders', 'POST', { ...payload, customerName: name, productId: i === 4 ? unknown.id : id, quantity: i < 3 ? i + 1 : 1, itemCost: 1, itemPrice: 1, deliveryCharge: 1, totalPrice: 1, deliveryChargePaid: true, orderSource: 'Walk-in' }, i > 0);
      assert.equal(created.status, 200, JSON.stringify(created.data));
      assert.ok(!('itemCost' in created.data));
      order = await prisma.order.findUnique({ where: { id: created.data.id } });
    }
    assert.ok(order);
    assert.equal(order.itemPrice, 600); assert.equal(order.itemCost, i === 4 ? null : 400);
    assert.equal(order.deliveryCharge, charge); assert.equal(order.totalPrice, 600 * order.quantity + charge);
    if (i === 0) { assert.equal(order.deliveryChargePaid, false); assert.equal(order.orderSource, 'Website'); }
    const updated = await api('/api/orders/' + order.id, 'PATCH', { status: statuses[i], paymentStatus: i === 3 ? 'Paid' : 'Unpaid' }, true);
    assert.equal(updated.status, 200); ids.push(order.id);
  }
  checks.push('Five dummy orders: single/multiple quantity, missing cost, five statuses, payment status and server totals');
  assert.equal((await api('/api/orders/' + ids[0], 'PATCH', { status: 'INVALID' }, true)).status, 400);
  assert.equal((await api('/api/orders/' + ids[0], 'PATCH', { paymentStatus: 'INVALID' }, true)).status, 400);
  assert.equal((await api('/api/orders/' + ids[0], 'PATCH', { deliveryChargePaid: true }, true)).status, 200);
  assert.equal((await api('/api/orders/' + ids[0], 'PATCH', { deliveryChargePaid: false }, true)).status, 200);
  await api('/api/products/' + id, 'PUT', { ...productBody, price: 750, costPrice: 450 }, true);
  const historical = await prisma.order.findUniqueOrThrow({ where: { id: ids[0] } });
  assert.equal(historical.itemCost, 400); assert.equal(historical.itemPrice, 600);
  assert.deepEqual(productProfit(historical.itemPrice, historical.itemCost), { profit: 200, margin: 33.33 });
  await api('/api/products/' + id, 'PUT', productBody, true);
  checks.push('Old order retains original cost/selling price after product changes; 200 profit and 33.33% margin');
  await prisma.product.update({ where: { id: unknown.id }, data: { stockStatus: 'Out of Stock' } });
  assert.equal((await api('/api/orders', 'POST', { ...payload, productId: unknown.id })).status, 400);
  checks.push('Out-of-stock product cannot be ordered');
  const badUpload = new FormData(); badUpload.append('file', new Blob(['demo'], { type: 'text/plain' }), 'demo.txt');
  assert.equal((await fetch(base + '/api/upload', { method: 'POST', body: badUpload })).status, 400);
  checks.push('Non-image upload rejected');
  const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addCookies([{ name: cookieName, value: token, url: base }]);
    const page = await context.newPage();
    const pageErrors: string[] = []; page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(base + '/admin/products');
    await page.getByRole('heading', { name: 'Products', exact: true }).waitFor();
    const row = page.getByRole('row').filter({ hasText: productBody.name });
    await row.getByRole('button', { name: 'Edit', exact: true }).click();
    const cost = page.getByLabel('Cost price per item (PKR)', { exact: false });
    await cost.waitFor(); assert.equal(await cost.inputValue(), '400');
    const selling = page.getByLabel('Selling price (PKR)'); assert.equal(await selling.inputValue(), '600');
    await cost.fill('410'); await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal((await api('/api/products/' + id, 'GET', undefined, true)).data.costPrice, 410);
    await api('/api/products/' + id, 'PUT', productBody, true);
    await page.goto(base + '/admin/orders');
    await page.getByText('DEMO QA Pending', { exact: true }).waitFor();
    assert.ok(await page.getByRole('columnheader', { name: 'Cost / item', exact: true }).isVisible());
    assert.ok(await page.getByRole('columnheader', { name: 'Selling / item', exact: true }).isVisible());
    await page.getByRole('button', { name: 'Add Manual Order' }).click();
    await page.getByRole('dialog').getByRole('combobox').first().selectOption(id);
    assert.ok((await page.getByRole('dialog').innerText()).includes('PKR ' + charge));
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.goto(base + '/admin/delivery-zones');
    await page.getByRole('heading', { name: 'Nationwide delivery' }).waitFor();
    await page.goto(base + '/admin/dashboard');
    await page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor();
    await page.getByText('DEMO QA Delivered', { exact: true }).waitFor();
    mkdirSync('artifacts/qa', { recursive: true });
    await page.screenshot({ path: 'artifacts/qa/admin-dashboard.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/admin/orders');
    await page.getByText('DEMO QA Pending', { exact: true }).waitFor();
    await page.screenshot({ path: 'artifacts/qa/admin-orders-mobile.png', fullPage: true });
    await context.close();
    const publicContext = await browser.newContext(); const publicPage = await publicContext.newPage();
    publicPage.on('pageerror', error => pageErrors.push(error.message));
    for (const path of ['/', '/shop', '/product/' + id, '/contact']) { const response = await publicPage.goto(base + path); assert.equal(response?.status(), 200, path); }
    await publicPage.goto(base + '/admin/products'); await publicPage.waitForURL('**/admin/login');
    assert.deepEqual(pageErrors, []);
    await publicContext.close(); checks.push('Browser: edit cost/save, orders table, manual-order pricing, delivery settings, dashboard, mobile, storefront and login redirect');
  } finally { await browser.close(); }
  // Keep only clearly marked test records; prevent their accidental purchase.
  await prisma.product.updateMany({ where: { id: { in: [id, unknown.id] }, description: marker }, data: { stockStatus: 'Out of Stock' } });
  const orders = await prisma.order.findMany({ where: { id: { in: ids } }, select: { trackingCode: true, customerName: true, status: true, quantity: true, itemCost: true, itemPrice: true, deliveryCharge: true, totalPrice: true } });
  mkdirSync('artifacts/qa', { recursive: true });
  writeFileSync('artifacts/qa/report.json', JSON.stringify({ checkedAt: new Date().toISOString(), checks, orders, limitations: ['SMTP is not configured; no reset email sent', 'No live payment or real courier booking performed', 'Cloudinary upload requires a separate live smoke check', 'Six existing catalog products still need actual cost prices'] }, null, 2));
  console.log(JSON.stringify({ checks, orders }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.product.updateMany({ where: { productCode: { in: ['DEMO-QA-COST', 'DEMO-QA-UNKNOWN'] }, description: marker }, data: { stockStatus: 'Out of Stock' } }); await prisma.$disconnect(); });
