import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/[userId] - Obtener historial del usuario
export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    // Agrupar por caseId para obtener mejor puntuación
    const bestScores: Record<string, { points: number; completed: boolean }> = {};
    
    for (const session of sessions) {
      if (!bestScores[session.caseId]) {
        bestScores[session.caseId] = { points: session.points, completed: session.completed };
      } else if (session.points > bestScores[session.caseId].points) {
        bestScores[session.caseId] = { points: session.points, completed: session.completed };
      }
    }

    return NextResponse.json({
      sessions,
      bestScores,
      totalPoints: Object.values(bestScores).reduce((sum, score) => sum + score.points, 0),
      totalSessions: sessions.length
    });
  } catch (error: any) {
    console.error("Error obteniendo sesiones:", error);
    return NextResponse.json(
      { error: "Error al obtener sesiones" },
      { status: 500 }
    );
  }
}
