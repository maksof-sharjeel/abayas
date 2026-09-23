import { isAdmin } from '@/lib/auth';
import { money } from '@/lib/profit';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        product: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      productId,
      quantity,
      size,
      orderSource,
      paymentMethodId,
      paymentScreenshotUrl,
      deliveryChargePaid,
      deliveryChargeScreenshotUrl,
      notes,
    } = body;

    const admin = await isAdmin();
    const count = typeof quantity === 'number' || typeof quantity === 'string' && /^\d+$/.test(quantity) ? Number(quantity) : NaN;
    if (!Number.isSafeInteger(count) || count < 1 || count > 10000 || typeof productId !== 'string' || typeof customerName !== 'string' || !customerName.trim() || customerName.length > 120 || typeof customerPhone !== 'string' || !/^[+0-9() -]{7,25}$/.test(customerPhone)) {
      return NextResponse.json({ error: 'Valid product, customer and quantity are required' }, { status: 400 });
    }
    const [product, delivery] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.deliveryZone.findFirst({ orderBy: { updatedAt: 'desc' } }),
    ]);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (product.stockStatus !== 'In Stock') return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 });
    if (size && (typeof size !== 'string' || !product.sizes.includes(size))) return NextResponse.json({ error: 'Select an available size' }, { status: 400 });
    if (!admin && (typeof customerAddress !== 'string' || !customerAddress.trim() || typeof customerCity !== 'string' || !customerCity.trim())) return NextResponse.json({ error: 'Address and city are required' }, { status: 400 });
    if (paymentMethodId) {
      if (typeof paymentMethodId !== 'string') return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
      const method = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } });
      if (!method?.isActive) return NextResponse.json({ error: 'Select an active payment method' }, { status: 400 });
    } else if (!admin) return NextResponse.json({ error: 'Payment method required' }, { status: 400 });
    if (deliveryChargeScreenshotUrl && (typeof deliveryChargeScreenshotUrl !== 'string' || !deliveryChargeScreenshotUrl.startsWith('https://res.cloudinary.com/' + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + '/'))) return NextResponse.json({ error: 'Invalid payment proof URL' }, { status: 400 });
    const deliveryCharge = delivery?.deliveryCharge ?? 0;
    const totalPrice = money(product.price * count + deliveryCharge);

    const trackingCode = 'ORD-' + randomUUID().slice(0, 12).toUpperCase();

    const order = await prisma.order.create({
      data: {
        trackingCode,
        customerId: admin ? customerId || null : null,
        customerName: customerName.trim(),
        customerPhone,
        customerAddress,
        customerCity,
        productId,
        productName: product.name,
        quantity: count,
        size,
        itemPrice: product.price,
        itemCost: product.costPrice,
        deliveryCharge,
        totalPrice,
        orderSource: admin && ['Phone', 'WhatsApp', 'Walk-in'].includes(orderSource) ? orderSource : 'Website',
        paymentMethodId: paymentMethodId || null,
        paymentScreenshotUrl,
        deliveryChargePaid: admin && deliveryChargePaid === true,
        deliveryChargeScreenshotUrl,
        notes,
      },
    });

    return NextResponse.json({ id: order.id, trackingCode: order.trackingCode, totalPrice: order.totalPrice, status: order.status });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
