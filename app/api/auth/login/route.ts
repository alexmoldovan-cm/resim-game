import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json() as LoginRequest;

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Verificar que el email esté verificado
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Por favor verifica tu email antes de iniciar sesión", code: "EMAIL_NOT_VERIFIED" },
        { status: 403 }
      );
    }

    // Crear token único (incluir timestamp para evitar duplicados)
    const timestamp = Date.now();
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email, timestamp })).toString("base64");

    // Eliminar sesiones previas del usuario y crear una nueva
    await prisma.authSession.deleteMany({
      where: { userId: user.id }
    });

    await prisma.authSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      }
    });

    return NextResponse.json({
      success: true,
      message: "Sesión iniciada exitosamente",
      userId: user.id,
      username: user.username,
      email: user.email,
      token
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ERROR EN LOGIN:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
