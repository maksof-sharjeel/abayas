import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { deliveryCharge } = body;

    const zone = await prisma.deliveryZone.update({
      where: { id },
      data: { deliveryCharge },
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Error updating delivery zone:', error);
    return NextResponse.json({ error: 'Failed to update delivery zone' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.deliveryZone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    return NextResponse.json({ error: 'Failed to delete delivery zone' }, { status: 500 });
  }
}
