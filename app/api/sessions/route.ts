import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, caseId, caseName, points, feedback } = await req.json();

    if (!userId || !caseId) {
      return NextResponse.json(
        { error: "userId y caseId son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Guardar sesión
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        caseId,
        caseName,
        points,
        feedback,
        completed: points >= 60 // Consideramos completado si tiene 60+ puntos
      }
    });

    return NextResponse.json({ session, success: true });
  } catch (error: any) {
    console.error("Error guardando sesión:", error);
    return NextResponse.json(
      { error: "Error al guardar la sesión" },
      { status: 500 }
    );
  }
}
