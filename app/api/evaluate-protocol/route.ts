import { NextResponse } from "next/server";
import { evaluateProtocolCompliance, getPerformanceLevel } from "@/lib/protocol-evaluation";
import { getClinicalCaseById } from "@/lib/clinical-cases-index";

interface EvaluationRequest {
  caseId: string;
  doctorResponse: string;
}

export async function POST(req: Request) {
  try {
    const { caseId, doctorResponse } = await req.json() as EvaluationRequest;

    if (!caseId || !doctorResponse) {
      return NextResponse.json(
        { error: "caseId y doctorResponse son requeridos" },
        { status: 400 }
      );
    }

    // Obtener el caso clínico
    const clinicalCase = getClinicalCaseById(caseId);
    if (!clinicalCase) {
      return NextResponse.json(
        { error: "Caso clínico no encontrado" },
        { status: 404 }
      );
    }

    // Evaluar según protocolo clínico
    const evaluation = evaluateProtocolCompliance(clinicalCase, doctorResponse);
    
    // Obtener nivel de desempeño
    const performanceLevel = getPerformanceLevel(evaluation.totalScore);

    return NextResponse.json({
      success: true,
      evaluation,
      performanceLevel,
      caseGuidelines: {
        source: clinicalCase.guidelines.source,
        conditionCode: clinicalCase.guidelines.conditionCode,
        recommendedTests: clinicalCase.guidelines.recommendedTests,
        treatmentOptions: clinicalCase.guidelines.treatmentOptions,
        referralIndications: clinicalCase.guidelines.referralIndications
      }
    });
  } catch (error: any) {
    console.error("Error evaluando según protocolo:", error);
    return NextResponse.json(
      { error: "Error al evaluar según protocolo clínico" },
      { status: 500 }
    );
  }
}
