// Sistema de evaluación basado en protocolos clínicos reales
// Cada evaluación se basa en guías clínicas (AAFP, GPC Española, etc.)

import { ClinicalCase } from "./clinical-cases";

export interface ProtocolEvaluation {
  caseId: string;
  doctorResponse: string;
  scores: {
    diagnosticAccuracy: number; // 0-40
    diagnosticDifferential: number; // 0-15
    appropriateTests: number; // 0-15
    treatmentPlan: number; // 0-15
    followUpPlan: number; // 0-10
    clinicalReasoning: number; // 0-5
  };
  totalScore: number;
  feedback: {
    diagnosticAccuracy: string;
    diagnosticDifferential: string;
    appropriateTests: string;
    treatmentPlan: string;
    followUpPlan: string;
    clinicalReasoning: string;
  };
  educationalNotes: string[];
  areas_to_improve: string[];
}

export function evaluateProtocolCompliance(
  clinicalCase: ClinicalCase,
  doctorResponse: string
): ProtocolEvaluation {
  const response = doctorResponse.toLowerCase();
  const evaluation: ProtocolEvaluation = {
    caseId: clinicalCase.id,
    doctorResponse,
    scores: {
      diagnosticAccuracy: 0,
      diagnosticDifferential: 0,
      appropriateTests: 0,
      treatmentPlan: 0,
      followUpPlan: 0,
      clinicalReasoning: 0
    },
    totalScore: 0,
    feedback: {
      diagnosticAccuracy: "",
      diagnosticDifferential: "",
      appropriateTests: "",
      treatmentPlan: "",
      followUpPlan: "",
      clinicalReasoning: ""
    },
    educationalNotes: clinicalCase.educationPoints,
    areas_to_improve: []
  };

  // 1. Evaluación de Diagnóstico Correcto (40 puntos)
  const correctDiagnosis = clinicalCase.correctDiagnosis.some(d =>
    response.includes(d.toLowerCase())
  );
  
  if (correctDiagnosis) {
    evaluation.scores.diagnosticAccuracy = 40;
    evaluation.feedback.diagnosticAccuracy = "✓ Diagnóstico principal correcto";
  } else {
    evaluation.feedback.diagnosticAccuracy = "✗ Diagnóstico principal no identificado. Esperado: " + clinicalCase.correctDiagnosis[0];
    evaluation.areas_to_improve.push("Revisión del diagnóstico principal");
  }

  // 2. Diagnóstico Diferencial (15 puntos)
  const hasAnyDifferential = clinicalCase.correctDifferentialDiagnosis.some(d =>
    response.includes(d.toLowerCase())
  );
  
  if (hasAnyDifferential) {
    evaluation.scores.diagnosticDifferential = 15;
    evaluation.feedback.diagnosticDifferential = "✓ Diagnóstico diferencial considerado";
  } else {
    evaluation.feedback.diagnosticDifferential = "✗ No se mencionó diagnóstico diferencial";
    evaluation.areas_to_improve.push("Siempre considerar diagnósticos diferenciales");
  }

  // 3. Pruebas Apropiadas (15 puntos)
  let testsCount = 0;
  const recommendedTests = clinicalCase.guidelines.recommendedTests;
  
  for (const test of recommendedTests) {
    if (response.includes(test.toLowerCase())) {
      testsCount++;
    }
  }

  if (testsCount >= recommendedTests.length * 0.6) {
    evaluation.scores.appropriateTests = 15;
    evaluation.feedback.appropriateTests = `✓ Pruebas apropiadas solicitadas (${testsCount}/${recommendedTests.length})`;
  } else if (testsCount > 0) {
    evaluation.scores.appropriateTests = 8;
    evaluation.feedback.appropriateTests = `~ Pruebas parciales (${testsCount}/${recommendedTests.length}). Falta: ${recommendedTests.slice(0, 2).join(", ")}`;
    evaluation.areas_to_improve.push(`Revisar pruebas indicadas: ${recommendedTests.join(", ")}`);
  } else {
    evaluation.feedback.appropriateTests = "✗ No se solicitaron pruebas complementarias";
    evaluation.areas_to_improve.push("Establecer plan de investigación según protocolo");
  }

  // 4. Plan de Tratamiento (15 puntos)
  let treatmentCount = 0;
  const correctTreatments = clinicalCase.correctTreatment;
  
  for (const treatment of correctTreatments) {
    if (response.includes(treatment.toLowerCase())) {
      treatmentCount++;
    }
  }

  if (treatmentCount >= correctTreatments.length * 0.5) {
    evaluation.scores.treatmentPlan = 15;
    evaluation.feedback.treatmentPlan = `✓ Plan de tratamiento adecuado (${treatmentCount} elementos)`;
  } else if (treatmentCount > 0) {
    evaluation.scores.treatmentPlan = 8;
    evaluation.feedback.treatmentPlan = `~ Tratamiento parcial (${treatmentCount} elementos)`;
    evaluation.areas_to_improve.push("Revisar opciones de tratamiento según guías");
  } else {
    evaluation.feedback.treatmentPlan = "✗ No se propuso plan de tratamiento";
    evaluation.areas_to_improve.push("Establecer plan terapéutico según protocolo");
  }

  // 5. Plan de Seguimiento (10 puntos)
  let followUpCount = 0;
  const correctFollowUp = clinicalCase.correctFollowUp;
  
  for (const followUp of correctFollowUp) {
    if (response.includes(followUp.toLowerCase())) {
      followUpCount++;
    }
  }

  if (followUpCount >= 2) {
    evaluation.scores.followUpPlan = 10;
    evaluation.feedback.followUpPlan = "✓ Seguimiento y control planificados";
  } else if (followUpCount === 1) {
    evaluation.scores.followUpPlan = 5;
    evaluation.feedback.followUpPlan = "~ Seguimiento parcial";
    evaluation.areas_to_improve.push("Planificar seguimiento más completo");
  } else {
    evaluation.feedback.followUpPlan = "✗ Falta plan de seguimiento";
    evaluation.areas_to_improve.push("Siempre planificar seguimiento y control");
  }

  // 6. Razonamiento Clínico (5 puntos extra)
  // Evalúa si el residentes justifica su razonamiento
  const hasReasoning = response.length > 150 && 
    (response.includes("porque") || response.includes("debido") || response.includes("por"));
  
  if (hasReasoning) {
    evaluation.scores.clinicalReasoning = 5;
    evaluation.feedback.clinicalReasoning = "✓ Razonamiento clínico documentado";
  } else {
    evaluation.feedback.clinicalReasoning = "~ Justificar más el razonamiento clínico";
  }

  // Cálculo total
  evaluation.totalScore = Object.values(evaluation.scores).reduce((a, b) => a + b, 0);

  return evaluation;
}

// Interpretación de la puntuación según estándares de medicina de familia
export function getPerformanceLevel(score: number): {
  level: string;
  description: string;
  recommendedAction: string;
} {
  if (score >= 90) {
    return {
      level: "Excelente",
      description: "Manejo completo según guías clínicas. Listo para práctica independiente.",
      recommendedAction: "Pasar al siguiente caso con mayor complejidad"
    };
  } else if (score >= 80) {
    return {
      level: "Bueno",
      description: "Manejo adecuado con algunos aspectos a mejorar",
      recommendedAction: "Revisar los puntos débiles antes de siguiente caso"
    };
  } else if (score >= 70) {
    return {
      level: "Aceptable",
      description: "Cumple mínimos pero necesita refuerzo",
      recommendedAction: "Revisar protocolo antes de repetir este caso"
    };
  } else if (score >= 60) {
    return {
      level: "En Desarrollo",
      description: "Carencias significativas en manejo",
      recommendedAction: "Repetir caso hasta alcanzar 80+ puntos"
    };
  } else {
    return {
      level: "Necesita Mejora",
      description: "Manejo insuficiente. No cumple estándares mínimos",
      recommendedAction: "Revisión completa de protocolo. Supervención recomendada"
    };
  }
}
