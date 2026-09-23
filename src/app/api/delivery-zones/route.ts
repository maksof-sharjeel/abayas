import { validMoney } from '@/lib/profit';
import { isAdmin } from '@/lib/auth';
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
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { deliveryCharge } = body;
    if (!validMoney(deliveryCharge)) return NextResponse.json({ error: 'Enter a valid non-negative delivery charge' }, { status: 400 });
    const zone = await prisma.$transaction(async (tx) => {
      const existing = await tx.deliveryZone.findFirst({ orderBy: { updatedAt: 'desc' } });
      return existing ? tx.deliveryZone.update({ where: { id: existing.id }, data: { deliveryCharge } }) : tx.deliveryZone.create({ data: { deliveryCharge } });
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json({ error: 'Failed to create delivery zone' }, { status: 500 });
  }
}
