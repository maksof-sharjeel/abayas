import type { Prisma } from '@prisma/client';
import { isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, deliveryChargePaid } = body;

    if (status !== undefined && !['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    if (paymentStatus !== undefined && !['Paid', 'Unpaid'].includes(paymentStatus)) return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    if (deliveryChargePaid !== undefined && typeof deliveryChargePaid !== 'boolean') return NextResponse.json({ error: 'Invalid delivery payment status' }, { status: 400 });
    const updateData: Prisma.OrderUpdateInput = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (typeof deliveryChargePaid === 'boolean') updateData.deliveryChargePaid = deliveryChargePaid;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
