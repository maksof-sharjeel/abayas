import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createResetToken, sendPasswordResetEmail } from '@/lib/password-reset';

export async function POST(request: Request) {
  const genericResponse = { message: 'If an account exists, a password reset link has been sent.' };

  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') return NextResponse.json(genericResponse);

    const admin = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!admin) return NextResponse.json(genericResponse);

    const { token, tokenHash } = createResetToken();
    await prisma.passwordResetToken.deleteMany({ where: { adminId: admin.id } });
    await prisma.passwordResetToken.create({
      data: { adminId: admin.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    await sendPasswordResetEmail(admin.email, `${baseUrl}/admin/reset-password?token=${token}`);
    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json({ error: 'Password reset email is not configured. Please contact the system administrator.' }, { status: 503 });
  }
}