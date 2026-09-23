import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        product: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
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
      productName,
      quantity,
      size,
      itemPrice,
      deliveryCharge,
      totalPrice,
      orderSource,
      paymentMethodId,
      paymentScreenshotUrl,
      deliveryChargePaid,
      deliveryChargeScreenshotUrl,
      notes,
    } = body;

    // Generate unique tracking code
    let trackingCode = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      trackingCode = `ORD-${randomDigits}`;
      
      const existing = await prisma.order.findUnique({
        where: { trackingCode },
      });
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique tracking code');
    }

    const order = await prisma.order.create({
      data: {
        trackingCode,
        customerId: customerId || null,
        customerName,
        customerPhone,
        customerAddress,
        customerCity,
        productId,
        productName,
        quantity: parseInt(quantity.toString()),
        size,
        itemPrice,
        deliveryCharge,
        totalPrice,
        orderSource,
        paymentMethodId: paymentMethodId || null,
        paymentScreenshotUrl,
        deliveryChargePaid: deliveryChargePaid || false,
        deliveryChargeScreenshotUrl,
        notes,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET_BY_TRACKING(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get('trackingCode');

    if (!trackingCode) {
      return NextResponse.json({ error: 'Tracking code required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { trackingCode },
      include: {
        product: true,
        paymentMethod: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order by tracking code:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
