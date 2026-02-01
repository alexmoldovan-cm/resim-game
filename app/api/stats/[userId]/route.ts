import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Obtener todas las sesiones del usuario
    const sessions = await prisma.session.findMany({
      where: { userId },
      select: {
        caseId: true,
        caseName: true,
        feedback: true,
        points: true,
        createdAt: true,
      },
    });

    if (sessions.length === 0) {
      return NextResponse.json({
        userId,
        totalPoints: 0,
        totalCases: 0,
        completedCases: 0,
        performanceByStep: {
          diagnosis: 0,
          differential: 0,
          tests: 0,
          treatment: 0,
          followup: 0,
        },
        bestScores: {},
      });
    }

    // Procesar feedback para extraer puntos por criterio
    let performanceByStep = {
      diagnosis: 0,
      differential: 0,
      tests: 0,
      treatment: 0,
      followup: 0,
    };

    let totalPoints = 0;
    let completedCases = 0;
    const bestScoresByCase: Record<string, number> = {};

    sessions.forEach((session) => {
      totalPoints += session.points;

      // Rastrear mejor puntaje por caso
      if (!bestScoresByCase[session.caseId] || session.points > bestScoresByCase[session.caseId]) {
        bestScoresByCase[session.caseId] = session.points;
      }

      if (session.points >= 100) {
        completedCases++;
      }

      // Extraer puntos del feedback si está disponible
      if (session.feedback) {
        const diagMatch = session.feedback.match(/Diagnóstico: (\d+)pts/);
        const ddMatch = session.feedback.match(/DD: (\d+)pts/);
        const testMatch = session.feedback.match(/Pruebas: (\d+)pts/);
        const treatMatch = session.feedback.match(/Tratamiento: (\d+)pts/);
        const followMatch = session.feedback.match(/Seguimiento: (\d+)pts/);

        if (diagMatch) performanceByStep.diagnosis += parseInt(diagMatch[1]);
        if (ddMatch) performanceByStep.differential += parseInt(ddMatch[1]);
        if (testMatch) performanceByStep.tests += parseInt(testMatch[1]);
        if (treatMatch) performanceByStep.treatment += parseInt(treatMatch[1]);
        if (followMatch) performanceByStep.followup += parseInt(followMatch[1]);
      }
    });

    // Calcular promedios
    const totalSessions = sessions.length;
    performanceByStep = {
      diagnosis: Math.round(performanceByStep.diagnosis / totalSessions) || 0,
      differential: Math.round(performanceByStep.differential / totalSessions) || 0,
      tests: Math.round(performanceByStep.tests / totalSessions) || 0,
      treatment: Math.round(performanceByStep.treatment / totalSessions) || 0,
      followup: Math.round(performanceByStep.followup / totalSessions) || 0,
    };

    return NextResponse.json({
      userId,
      totalPoints,
      totalCases: Object.keys(bestScoresByCase).length,
      completedCases,
      performanceByStep,
      bestScores: bestScoresByCase,
      averageScore: Math.round(totalPoints / totalSessions),
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
