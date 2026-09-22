import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const zones = await prisma.deliveryZone.findMany({
      orderBy: { cityName: 'asc' },
    });
    return NextResponse.json(zones);
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery zones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cityName, deliveryCharge } = body;

    const zone = await prisma.deliveryZone.create({
      data: {
        cityName,
        deliveryCharge,
      },
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json({ error: 'Failed to create delivery zone' }, { status: 500 });
  }
}
