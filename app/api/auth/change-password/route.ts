import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export async function POST(req: Request) {
  try {
    const { userId, currentPassword, newPassword } = await req.json() as ChangePasswordRequest;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Campos requeridos: userId, currentPassword, newPassword" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Contraseña actual incorrecta" },
        { status: 401 }
      );
    }

    // Validar nueva contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña no puede ser igual a la actual" },
        { status: 400 }
      );
    }

    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente"
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ERROR EN CHANGE PASSWORD:", error);
    return NextResponse.json(
      { error: "Error al cambiar la contraseña" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
