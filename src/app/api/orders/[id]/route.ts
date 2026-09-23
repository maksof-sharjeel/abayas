import type { Prisma } from '@prisma/client';
import { isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validMoney } from '@/lib/profit';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid order update' }, { status: 400 });
    const { status, paymentStatus, deliveryChargePaid, itemCost } = body;

    if (status !== undefined && !['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    if (paymentStatus !== undefined && !['Paid', 'Unpaid'].includes(paymentStatus)) return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    if (deliveryChargePaid !== undefined && typeof deliveryChargePaid !== 'boolean') return NextResponse.json({ error: 'Invalid delivery payment status' }, { status: 400 });
    if (itemCost !== undefined && itemCost !== null && !validMoney(itemCost)) return NextResponse.json({ error: 'Purchase cost must be a non-negative amount with at most two decimals, or blank for pending.' }, { status: 400 });
    const updateData: Prisma.OrderUpdateInput = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (typeof deliveryChargePaid === 'boolean') updateData.deliveryChargePaid = deliveryChargePaid;
    // Update this order's actual vendor cost, never the catalog or other orders.
    if (itemCost !== undefined) updateData.itemCost = itemCost;
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: 'No supported order changes supplied' }, { status: 400 });

    if (!await prisma.order.findUnique({ where: { id }, select: { id: true } })) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

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
