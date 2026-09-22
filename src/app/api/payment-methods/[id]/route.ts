import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, instructions, isActive } = body;

    const method = await prisma.paymentMethod.update({
      where: { id: params.id },
      data: { name, instructions, isActive },
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if method has orders
    const orderCount = await prisma.order.count({
      where: { paymentMethodId: params.id },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete payment method with existing orders. Mark it inactive instead.' },
        { status: 400 }
      );
    }

    await prisma.paymentMethod.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
  }
}
