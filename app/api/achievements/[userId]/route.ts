import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS, PlayerStats, getUnlockedAchievements } from "@/lib/achievements";

// GET /api/achievements/[userId] - Obtener logros del usuario
export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Obtener todas las sesiones del usuario
    const sessions = await prisma.session.findMany({
      where: { userId }
    });

    // Calcular estadísticas
    const casesCompleted: Record<string, number> = {};
    let totalPoints = 0;
    let perfectScores = 0;

    for (const session of sessions) {
      if (!casesCompleted[session.caseId]) {
        casesCompleted[session.caseId] = session.points;
      } else if (session.points > casesCompleted[session.caseId]) {
        casesCompleted[session.caseId] = session.points;
      }
    }

    for (const [_, points] of Object.entries(casesCompleted)) {
      totalPoints += points;
      if (points === 100) perfectScores++;
    }

    const playerStats: PlayerStats = {
      totalPoints,
      totalSessions: sessions.length,
      casesCompleted,
      perfectScores,
      allCasesCompleted: Object.keys(casesCompleted).length >= 5
    };

    // Obtener logros desbloqueados
    const unlockedAchievements = getUnlockedAchievements(playerStats);
    
    // Obtener logros desbloqueados en base de datos
    const dbAchievements = await prisma.achievement.findMany({
      where: { userId }
    });

    return NextResponse.json({
      playerStats,
      unlockedAchievements,
      dbAchievements
    });
  } catch (error: any) {
    console.error("Error obteniendo logros:", error);
    return NextResponse.json(
      { error: "Error al obtener logros" },
      { status: 500 }
    );
  }
}

// POST /api/achievements/[userId] - Guardar logro desbloqueado
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { badgeId } = await req.json();

    const achievement = ACHIEVEMENTS.find(a => a.id === badgeId);
    if (!achievement) {
      return NextResponse.json(
        { error: "Logro no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya existe
    const existing = await prisma.achievement.findUnique({
      where: {
        userId_badgeId: { userId, badgeId }
      }
    });

    if (existing) {
      return NextResponse.json({ achievement: existing, newlyUnlocked: false });
    }

    // Crear nuevo logro
    const newAchievement = await prisma.achievement.create({
      data: {
        userId,
        badgeId,
        badgeName: achievement.name,
        description: achievement.description
      }
    });

    return NextResponse.json({ achievement: newAchievement, newlyUnlocked: true });
  } catch (error: any) {
    console.error("Error guardando logro:", error);
    return NextResponse.json(
      { error: "Error al guardar logro" },
      { status: 500 }
    );
  }
}
