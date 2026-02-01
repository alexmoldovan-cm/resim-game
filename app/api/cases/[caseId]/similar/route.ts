import { NextResponse } from "next/server";
import { AVAILABLE_CASES } from "@/lib/clinical-cases-index";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    // Encontrar el caso actual
    const currentCase = AVAILABLE_CASES.find((c: any) => c.id === caseId);

    if (!currentCase) {
      return NextResponse.json(
        { error: "Caso no encontrado" },
        { status: 404 }
      );
    }

    // Buscar casos similares (misma especialidad, excluir el actual)
    const similarCases = AVAILABLE_CASES.filter((c: any) => 
      c.specialization === currentCase.specialization && 
      c.id !== caseId
    ).slice(0, 5).map((c: any) => ({
      id: c.id,
      name: c.name,
      specialization: c.specialization,
      presentingComplaint: c.presentingComplaint,
    }));

    return NextResponse.json({
      currentCaseId: caseId,
      currentCaseName: currentCase.name,
      similarCases,
    });
  } catch (error) {
    console.error("Error fetching similar cases:", error);
    return NextResponse.json(
      { error: "Error al obtener casos similares" },
      { status: 500 }
    );
  }
}
