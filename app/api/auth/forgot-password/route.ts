import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if email exists
      return NextResponse.json(
        { success: true, message: 'If an account exists with this email, a reset link has been sent' },
        { status: 200 }
      );
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = randomBytes(32).toString('hex');
    
    // Set expiration to 30 minutes from now
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

    // Update user with reset token and expiration
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires,
      },
    });

    // In production, you would send an email here with the reset link
    // For now, return the token so it can be used in development
    return NextResponse.json(
      {
        success: true,
        message: 'Password reset email sent',
        resetToken, // Remove this in production
        resetLink: `/reset-password/${resetToken}`, // This would be sent via email in production
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
