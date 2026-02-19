import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always return success to prevent user enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email.trim())}`;

    await sendEmail({
      to: email.trim(),
      subject: 'Reset your Financi AI password',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #0f172a;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">Password Reset</h1>
          <p>You requested a password reset for your Financi AI account.</p>
          <p style="margin: 16px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">
              Reset Password
            </a>
          </p>
          <p style="font-size: 13px; color: #64748b;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
