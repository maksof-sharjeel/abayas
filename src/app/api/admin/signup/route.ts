import { isAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    if (await prisma.admin.count() > 0 && !await isAdmin()) return NextResponse.json({ error: 'Only an existing admin can create another admin account' }, { status: 403 });
    const body = await request.json();
    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || typeof body.password !== 'string' || body.password.length < 8) return NextResponse.json({ error: 'Valid email and password of at least 8 characters required' }, { status: 400 });
    body.email = body.email.trim().toLowerCase();
    
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
    await prisma.admin.create({
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
