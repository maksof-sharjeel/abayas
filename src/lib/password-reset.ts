import crypto from 'crypto';
import nodemailer from 'nodemailer';

export function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, tokenHash: crypto.createHash('sha256').update(token).digest('hex') };
}

export function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getMailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const mailer = getMailer();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!mailer || !from) throw new Error('SMTP is not configured');

  await mailer.sendMail({
    from,
    to: email,
    subject: 'Reset your SK Hand Embroidery admin password',
    text: `Use this link to reset your admin password. It expires in 60 minutes:\n\n${resetUrl}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Reset your admin password</h2><p>This link expires in 60 minutes.</p><p><a href="${resetUrl}" style="background:#2c211e;color:#fff;padding:12px 18px;text-decoration:none;border-radius:24px">Reset password</a></p><p>If you did not request this, you can ignore this email.</p></div>`,
  });
}