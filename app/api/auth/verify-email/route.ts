import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Buscar el token en la base de datos
    const session = await prisma.authSession.findFirst({
      where: {
        token,
        type: 'email_verification',
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Token no válido o expirado' },
        { status: 400 }
      );
    }

    // Verificar que no ha expirado
    if (new Date() > session.expiresAt) {
      await prisma.authSession.delete({
        where: { id: session.id },
      });
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Buscar al usuario por email
    let user = await prisma.user.findUnique({
      where: { email: session.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Marcar el usuario como verificado
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Eliminar el token de verificación
    await prisma.authSession.delete({
      where: { id: session.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verificado correctamente. Ahora puedes iniciar sesión.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, verificationCode } = await req.json();

    if (!userId || !verificationCode) {
      return NextResponse.json(
        { error: 'User ID and verification code are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Check verification code
    if (user.verificationCode !== verificationCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update user - mark email as verified
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        verificationCode: null,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
