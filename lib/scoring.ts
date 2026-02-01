// Sistema de puntuación para simulaciones médicas

export interface ScoringResult {
  points: number;
  diagnosticoCorrect: boolean;
  medicacionCorrect: boolean;
  tratamientoCorrect: boolean;
  feedback: string;
}

export interface CaseDefinition {
  id: string;
  name: string;
  correctDiagnosis: string[];
  correctMedications: string[];
  correctTreatments: string[];
  maxPoints: number;
}

// Definición del caso clínico: Dolor torácico agudo (Juan, 45 años)
export const CASE_CHEST_PAIN: CaseDefinition = {
  id: "chest-pain-001",
  name: "Dolor Torácico Agudo",
  correctDiagnosis: [
    "infarto",
    "infarto de miocardio",
    "iam",
    "síndrome coronario agudo",
    "angina de pecho",
    "angina",
    "isquemia",
    "isquemia miocárdica"
  ],
  correctMedications: [
    "aspirina",
    "ácido acetilsalicílico",
    "aas",
    "nitratos",
    "nitroglicerina",
    "betabloqueantes",
    "metoprolol",
    "atenolol",
    "anticoagulantes",
    "heparina",
    "enoxaparina"
  ],
  correctTreatments: [
    "hospitalización",
    "ingreso",
    "monitoreo",
    "monitorización",
    "electrocardiograma",
    "ecg",
    "troponinas",
    "análisis de sangre",
    "cateterismo",
    "angioplastia",
    "reperfusión",
    "oxígeno",
    "reposo",
    "quirófano",
    "cuidados intensivos",
    "uci"
  ],
  maxPoints: 100
};

export function evaluateResponse(
  caseDefinition: CaseDefinition,
  doctorMessage: string
): ScoringResult {
  const lowerMessage = doctorMessage.toLowerCase();
  
  // Evaluar diagnóstico (40 puntos)
  const diagnosticoCorrect = caseDefinition.correctDiagnosis.some(
    diagnosis => lowerMessage.includes(diagnosis)
  );
  const diagnosticoPuntos = diagnosticoCorrect ? 40 : 0;
  
  // Evaluar medicación (30 puntos)
  const medicacionCorrect = caseDefinition.correctMedications.some(
    med => lowerMessage.includes(med)
  );
  const medicacionPuntos = medicacionCorrect ? 30 : 0;
  
  // Evaluar tratamiento (30 puntos)
  const tratamientoCorrect = caseDefinition.correctTreatments.some(
    treatment => lowerMessage.includes(treatment)
  );
  const tratamientoPuntos = tratamientoCorrect ? 30 : 0;
  
  // Total
  const totalPoints = diagnosticoPuntos + medicacionPuntos + tratamientoPuntos;
  
  // Generar feedback
  const feedbackParts: string[] = [];
  
  if (diagnosticoCorrect) {
    feedbackParts.push("✓ Diagnóstico correcto (+40pts)");
  } else {
    feedbackParts.push("✗ Diagnóstico incorrecto o no especificado");
  }
  
  if (medicacionCorrect) {
    feedbackParts.push("✓ Medicación apropiada (+30pts)");
  } else {
    feedbackParts.push("✗ Medicación no recomendada");
  }
  
  if (tratamientoCorrect) {
    feedbackParts.push("✓ Tratamiento adecuado (+30pts)");
  } else {
    feedbackParts.push("✗ Tratamiento no adecuado");
  }
  
  const feedback = feedbackParts.join(" | ");
  
  return {
    points: totalPoints,
    diagnosticoCorrect,
    medicacionCorrect,
    tratamientoCorrect,
    feedback
  };
}

export function getCaseDefinition(caseId: string): CaseDefinition {
  switch (caseId) {
    case "chest-pain-001":
      return CASE_CHEST_PAIN;
    case "sepsis-001":
      return CASE_SEPSIS;
    case "stroke-001":
      return CASE_STROKE;
    case "pneumonia-001":
      return CASE_PNEUMONIA;
    case "diabetic-ketoacidosis-001":
      return CASE_DIABETIC_KETOACIDOSIS;
    default:
      return CASE_CHEST_PAIN;
  }
}

// Caso 2: Sepsis (María, 38 años)
export const CASE_SEPSIS: CaseDefinition = {
  id: "sepsis-001",
  name: "Sepsis",
  correctDiagnosis: [
    "sepsis",
    "síndrome de respuesta inflamatoria",
    "infección grave",
    "choque séptico",
    "bacteriemia"
  ],
  correctMedications: [
    "antibióticos",
    "ampicilina",
    "ceftriaxona",
    "gentamicina",
    "vancomicina",
    "fluconazol",
    "vasopresores",
    "noradrenalina",
    "dobutamina"
  ],
  correctTreatments: [
    "hospitalización",
    "uci",
    "cuidados intensivos",
    "fluidos intravenosos",
    "suero fisiológico",
    "cultivos",
    "hemocultivos",
    "lactato",
    "soporte vasopresor",
    "monitorización hemodinámica",
    "catéter central"
  ],
  maxPoints: 100
};

// Caso 3: Accidente cerebrovascular (Carlos, 62 años)
export const CASE_STROKE: CaseDefinition = {
  id: "stroke-001",
  name: "Accidente Cerebrovascular",
  correctDiagnosis: [
    "ictus",
    "acv",
    "accidente cerebrovascular",
    "infarto cerebral",
    "stroke",
    "enfermedad cerebrovascular"
  ],
  correctMedications: [
    "alteplasa",
    "rt-pa",
    "ácido acetilsalicílico",
    "anticoagulantes",
    "heparina",
    "estatinas",
    "atorvastatina",
    "antiagregantes"
  ],
  correctTreatments: [
    "hospitalización",
    "uci",
    "resonancia magnética",
    "rm",
    "tomografía",
    "tac",
    "angiografía",
    "trombectomía",
    "neuroimagen",
    "monitorización",
    "vigilancia"
  ],
  maxPoints: 100
};

// Caso 4: Neumonía (Elena, 72 años)
export const CASE_PNEUMONIA: CaseDefinition = {
  id: "pneumonia-001",
  name: "Neumonía",
  correctDiagnosis: [
    "neumonía",
    "pulmonía",
    "infección respiratoria",
    "infección pulmonar",
    "bronconeumonía"
  ],
  correctMedications: [
    "amoxicilina",
    "azitromicina",
    "cefalosporinas",
    "ceftriaxona",
    "fluoroquinolonas",
    "levofloxacino",
    "macrólidosácido",
    "paracetamol"
  ],
  correctTreatments: [
    "hospitalización",
    "radiografía de tórax",
    "rx",
    "oxígeno",
    "saturación",
    "antibióticos",
    "fluidos intravenosos",
    "reposo",
    "nebulización",
    "fisioterapia"
  ],
  maxPoints: 100
};

// Caso 5: Cetoacidosis diabética (David, 35 años)
export const CASE_DIABETIC_KETOACIDOSIS: CaseDefinition = {
  id: "diabetic-ketoacidosis-001",
  name: "Cetoacidosis Diabética",
  correctDiagnosis: [
    "cetoacidosis",
    "cetoacidosis diabética",
    "cad",
    "diabetes descompensada",
    "hiperglucemia"
  ],
  correctMedications: [
    "insulina",
    "suero fisiológico",
    "cloruro potásico",
    "potasio",
    "bicarbonato",
    "solución glucosada"
  ],
  correctTreatments: [
    "hospitalización",
    "uci",
    "monitorización",
    "glucemia",
    "electrolitos",
    "gases arteriales",
    "ph",
    "infusión continua",
    "catéter venoso",
    "diálisis"
  ],
  maxPoints: 100
};
