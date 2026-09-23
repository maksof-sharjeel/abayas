import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.deliveryZone.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(setting || { id: null, deliveryCharge: 0 });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery zones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deliveryCharge } = body;
    await prisma.deliveryZone.deleteMany({});
    const zone = await prisma.deliveryZone.create({ data: { deliveryCharge } });

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json({ error: 'Failed to create delivery zone' }, { status: 500 });
  }
}
