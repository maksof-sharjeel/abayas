import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
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
