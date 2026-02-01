import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token } = await req.json() as { token?: string };

    if (token) {
      // Eliminar sesión de la BD
      await prisma.authSession.delete({
        where: { token }
      }).catch(() => {
        // Ignorar si no existe
      });
    }

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada"
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ERROR EN LOGOUT:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
