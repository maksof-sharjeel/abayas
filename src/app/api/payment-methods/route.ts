import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const methods = await prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, instructions, isActive } = body;

    const method = await prisma.paymentMethod.create({
      data: {
        name,
        instructions,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 });
  }
}
