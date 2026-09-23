import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hashResetToken } from '@/lib/password-reset';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || typeof token !== 'string' || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This reset link is invalid or expired.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.admin.update({ where: { id: resetToken.adminId }, data: { password: hashedPassword } }),
      prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
      prisma.passwordResetToken.deleteMany({ where: { adminId: resetToken.adminId } }),
    ]);

    return NextResponse.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Unable to reset password.' }, { status: 500 });
  }
}