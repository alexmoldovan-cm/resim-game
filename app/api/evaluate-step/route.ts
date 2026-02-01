import { NextResponse } from "next/server";

interface StepEvaluationRequest {
  caseId: string;
  stepType: "diagnosis" | "differential" | "tests" | "treatment" | "followup";
  stepContent: string;
  caseContext: any;
}

export async function POST(req: Request) {
  try {
    const { caseId, stepType, stepContent, caseContext } = await req.json() as StepEvaluationRequest;

    if (!caseId || !stepType || !stepContent) {
      return NextResponse.json(
        { error: "Parámetros requeridos: caseId, stepType, stepContent" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found");
      return NextResponse.json(
        { error: "API key no configurada" },
        { status: 500 }
      );
    }

    // Prompt específico para cada paso
    const prompts: Record<string, string> = {
      diagnosis: `Eres un médico experto evaluador. El paciente presenta: "${caseContext.presentingComplaint}"
      
Historia: ${caseContext.historyOfPresentIllness}

Diagnósticos correctos esperados: ${caseContext.correctDiagnosis.join(", ")}

Respuesta del médico: "${stepContent}"

Evalúa si el diagnóstico del médico es correcto o al menos válido. Sé flexible con el lenguaje - acepta diagnósticos que sean clínicamente correctos aunque estén redactados diferente.

Responde SOLO en JSON válido (sin texto adicional):
{
  "isCorrect": boolean,
  "score": número de 0 a 40,
  "feedback": "si es correcto, di por qué. Si no, qué le falta",
  "explanation": "breve explicación educativa",
  "clinicalReferences": ["Guideline reference 1", "Key concept 2"],
  "learnMore": "Recomendación de lectura o concepto clave"
}`,

      differential: `Eres un médico evaluador. El cuadro clínico es: "${caseContext.presentingComplaint}"
      
Diagnósticos diferenciales esperados: ${caseContext.correctDifferentialDiagnosis.join(", ")}
Respuesta del médico: "${stepContent}"

¿Los diagnósticos diferenciales que menciona el médico son válidos? Sé flexible - acepta cualquier DD clínicamente relevante al cuadro.

Responde SOLO en JSON válido:
{
  "isCorrect": boolean,
  "score": número de 0 a 15,
  "feedback": "evaluación breve",
  "explanation": "por qué es correcto o qué falta",
  "clinicalReferences": ["Guideline reference"],
  "learnMore": "Concepto educativo"
}`,

      tests: `Eres un médico evaluador. El diagnóstico es: ${caseContext.correctDiagnosis.join(", ")}
      
Pruebas diagnósticas recomendadas: ${caseContext.correctInitialTests.join(", ")}
Respuesta del médico: "${stepContent}"

¿Las pruebas que ordena el médico son apropiadas? Sé flexible - acepta variaciones razonables.

Responde SOLO en JSON válido:
{
  "isCorrect": boolean,
  "score": número de 0 a 15,
  "feedback": "evaluación breve",
  "explanation": "explicación",
  "clinicalReferences": ["Guideline reference"],
  "learnMore": "Concepto educativo"
}`,

      treatment: `Eres un médico evaluador. El diagnóstico confirmado es: ${caseContext.correctDiagnosis.join(", ")}
      
Opciones de tratamiento recomendado: ${caseContext.correctTreatment.join(", ")}
Respuesta del médico: "${stepContent}"

¿El plan de tratamiento del médico es apropiado? Sé flexible - acepta variaciones clínicamente válidas.

Responde SOLO en JSON válido:
{
  "isCorrect": boolean,
  "score": número de 0 a 15,
  "feedback": "evaluación breve",
  "explanation": "explicación",
  "clinicalReferences": ["Guideline reference"],
  "learnMore": "Concepto educativo"
}`,

      followup: `Eres un médico evaluador. El diagnóstico es: ${caseContext.correctDiagnosis.join(", ")}
      
Seguimiento recomendado: ${caseContext.correctFollowUp.join(", ")}
Respuesta del médico: "${stepContent}"

¿El plan de seguimiento incluye los elementos clave? Sé flexible - acepta variaciones razonables.

Responde SOLO en JSON válido:
{
  "isCorrect": boolean,
  "score": número de 0 a 10,
  "feedback": "evaluación breve",
  "explanation": "explicación",
  "clinicalReferences": ["Guideline reference"],
  "learnMore": "Concepto educativo"
}`
    };

    const prompt = prompts[stepType] || prompts.diagnosis;

    // Llamar a Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("Gemini error:", data.error);
      return NextResponse.json(
        { error: "Error al evaluar con IA" },
        { status: 500 }
      );
    }

    // Extraer respuesta JSON
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let evaluation;
    
    try {
      // Intentar extraer JSON entre las primeras y últimas llaves
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      console.error("Error parsing JSON:", content);
      evaluation = {
        isCorrect: false,
        score: 0,
        feedback: "No se pudo evaluar. Respuesta: " + content.substring(0, 100),
        explanation: "Error en la evaluación"
      };
    }

    return NextResponse.json({
      success: true,
      stepType,
      evaluation,
      totalPoints: evaluation.score
    });
  } catch (error) {
    console.error("Error evaluando paso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
