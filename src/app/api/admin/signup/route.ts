import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: body.email },
    });
    
    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: body.email,
        password: hashedPassword,
      },
    });
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
