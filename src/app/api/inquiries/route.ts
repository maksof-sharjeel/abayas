import { isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ error: 'Name, phone and message are required' }, { status: 400 });
    }

    const inquiry = await prisma.contactInquiry.create({
      data: { name, phone, message },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 });
  }
}