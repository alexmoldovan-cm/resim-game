import { ClinicalCase, PatientProfile } from "./clinical-cases";

/**
 * Simulador de Synthea sin requerir instalación del JAR
 * Genera pacientes sintéticos realistas para medicina de familia
 */

const FIRST_NAMES = {
  M: ["Carlos", "Juan", "Antonio", "Miguel", "Pedro", "José", "Luis", "Fernando", "Andrés", "Ricardo", "Jorge", "Raúl"],
  F: ["María", "Carmen", "Ana", "Isabel", "Rosa", "Teresa", "Patricia", "Magdalena", "Gloria", "Josefina", "Catalina"]
};

const LAST_NAMES = ["García", "Rodríguez", "Martínez", "Hernández", "López", "González", "Pérez", "Sánchez", "Ramirez", "Torres", "Flores", "Rivera", "Díaz", "Cruz", "Moreno", "Gutierrez"];

const OCCUPATIONS = [
  "Ingeniero",
  "Docente",
  "Empleado de oficina",
  "Vendedor",
  "Técnico",
  "Abogado",
  "Contador",
  "Obrero",
  "Mecánico",
  "Electricista",
  "Profesor",
  "Administrativo",
  "Conductor",
  "Agricultor",
  "Empresario",
  "Jubilado",
  "Ama de casa"
];

const MEDICAL_CONDITIONS = [
  { name: "Diabetes tipo 2", code: "E11", percentage: 30 },
  { name: "Hipertensión", code: "I10", percentage: 45 },
  { name: "Dislipidemia", code: "E78", percentage: 25 },
  { name: "Síndrome metabólico", code: "E88.81", percentage: 15 },
  { name: "Enfermedad tiroidea", code: "E00-E07", percentage: 8 },
  { name: "EPOC", code: "J43-J44", percentage: 10 }
];

const MEDICATIONS = {
  "E11": ["Metformina 500mg", "Glibenclamida 5mg", "Insulina NPH"],
  "I10": ["Enalapril 10mg", "Losartán 50mg", "Amlodipina 5mg", "Hidroclorotiazida 25mg"],
  "E78": ["Atorvastatina 20mg", "Simvastatina 20mg"],
  "E88.81": ["Metformina 500mg", "Enalapril 10mg", "Atorvastatina 20mg"],
  "E00-E07": ["Levotiroxina 75mcg", "Propranolol 40mg"],
  "J43-J44": ["Salbutamol inhalador", "Beclometasona inhalador", "Bromuro de ipratropio"]
};

const PRESENTING_COMPLAINTS = [
  "Control de presión arterial",
  "Revisión de niveles de glucosa",
  "Dolor de cabeza persistente",
  "Cansancio y fatiga",
  "Tos persistente",
  "Molestias gástricas",
  "Dolor en el pecho",
  "Dificultad para respirar",
  "Mareos",
  "Insomnio",
  "Ansiedad",
  "Dolores articulares"
];

interface SyntheaPatient {
  firstName: string;
  lastName: string;
  age: number;
  gender: "M" | "F";
  occupation: string;
  pastMedicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  familyHistory: string[];
  smokingStatus: "never" | "former" | "current";
  alcoholUse: "none" | "moderate" | "heavy";
}

/**
 * Genera pacientes sintéticos aleatorios
 */
export function generateSyntheaPatients(count: number): SyntheaPatient[] {
  const patients: SyntheaPatient[] = [];

  for (let i = 0; i < count; i++) {
    const gender = Math.random() > 0.5 ? "M" : "F";
    const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    // Edad entre 18 y 85 años, con distribución realista
    const age = Math.floor(Math.random() * 68) + 18;

    // Generar condiciones médicas basadas en edad
    const pastMedicalHistory: string[] = [];
    const conditionsToConsider = age > 40 ? MEDICAL_CONDITIONS : MEDICAL_CONDITIONS.slice(0, 3);

    for (const condition of conditionsToConsider) {
      if (Math.random() * 100 < condition.percentage * (age / 50)) {
        pastMedicalHistory.push(condition.name);
      }
    }

    // Medicaciones basadas en condiciones
    const currentMedications: string[] = [];
    for (const condition of pastMedicalHistory) {
      const condCode = MEDICAL_CONDITIONS.find(c => c.name === condition)?.code;
      if (condCode && MEDICATIONS[condCode as keyof typeof MEDICATIONS]) {
        const meds = MEDICATIONS[condCode as keyof typeof MEDICATIONS];
        const randomMeds = meds.slice(0, Math.random() > 0.5 ? 1 : 2);
        currentMedications.push(...randomMeds);
      }
    }

    // Alergias
    const allergies: string[] = [];
    if (Math.random() > 0.7) {
      const commonAllergies = ["Penicilina", "Ibuprofeno", "Aspirina", "Dipirona", "Etoricoxib"];
      allergies.push(commonAllergies[Math.floor(Math.random() * commonAllergies.length)]);
    }

    // Historia familiar
    const familyHistory: string[] = [];
    if (Math.random() > 0.6) {
      familyHistory.push("Diabetes tipo 2");
    }
    if (Math.random() > 0.7) {
      familyHistory.push("Hipertensión");
    }
    if (Math.random() > 0.8) {
      familyHistory.push("Enfermedad cardiovascular");
    }

    // Hábitos
    const smokingStatus = Math.random() > 0.6 ? "current" : Math.random() > 0.5 ? "former" : "never";
    const alcoholRandom = Math.random();
    const alcoholUse: "none" | "moderate" | "heavy" = alcoholRandom > 0.65 ? "none" : alcoholRandom > 0.35 ? "moderate" : "heavy";

    patients.push({
      firstName,
      lastName,
      age,
      gender,
      occupation: OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)],
      pastMedicalHistory,
      currentMedications: Array.from(new Set(currentMedications)), // Remover duplicados
      allergies,
      familyHistory,
      smokingStatus,
      alcoholUse
    });
  }

  return patients;
}

/**
 * Convierte un paciente Synthea en un ClinicalCase completo
 */
export function syntheaToClinicalCase(patient: SyntheaPatient, caseIndex: number): ClinicalCase {
  const conditions = patient.pastMedicalHistory;
  let selectedCondition = conditions.length > 0 ? conditions[0] : "Revisión de rutina";

  // Seleccionar presentación clínica basada en condiciones
  const presentingComplaint = PRESENTING_COMPLAINTS[caseIndex % PRESENTING_COMPLAINTS.length];

  // Generar vital signs realistas basados en la edad y condiciones
  const vitalSigns = generateRealisticVitalSigns(patient);

  // Generar historia clínica realista
  const historyOfPresentIllness = generateHistoryOfPresentIllness(presentingComplaint, patient);

  // Generar examen físico
  const physicalExam = generatePhysicalExam(patient, vitalSigns);

  // Mapear a ICD-10
  const icd10Map: Record<string, string> = {
    "Diabetes tipo 2": "E11",
    "Hipertensión": "I10",
    "Dislipidemia": "E78",
    "Síndrome metabólico": "E88.81",
    "EPOC": "J44.9"
  };

  const icd10Code = icd10Map[selectedCondition] || "Z00.00";

  // Crear perfil del paciente
  const patientProfile: PatientProfile = {
    id: `synthea-${caseIndex}`,
    name: `${patient.firstName} ${patient.lastName}`,
    age: patient.age,
    gender: patient.gender,
    occupation: patient.occupation,
    pastMedicalHistory: patient.pastMedicalHistory,
    currentMedications: patient.currentMedications,
    allergies: patient.allergies,
    familyHistory: patient.familyHistory,
    socialHistory: {
      smoking: patient.smokingStatus,
      alcohol: patient.alcoholUse,
      otherSubstances: []
    }
  };

  // Crear caso clínico
  const clinicalCase: ClinicalCase = {
    id: `synthea-${patient.firstName.toLowerCase()}-${caseIndex}`,
    name: `Caso Synthea: ${patient.firstName} ${patient.lastName}`,
    specialization: "medicina_familia",
    patient: patientProfile,
    presentingComplaint,
    historyOfPresentIllness,
    vitalSigns,
    physicalExam,
    initialAssessment: `Paciente de ${patient.age} años con antecedentes de ${patient.pastMedicalHistory.join(", ") || "sin antecedentes significativos"}, que acude por ${presentingComplaint.toLowerCase()}.`,
    guidelines: {
      source: "AAFP/GPC España/UpToDate",
      conditionCode: icd10Code,
      recommendedTests: generateRecommendedTests(selectedCondition),
      treatmentOptions: generateTreatmentOptions(selectedCondition),
      referralIndications: generateReferralIndications(selectedCondition)
    },
    correctDiagnosis: [selectedCondition],
    correctDifferentialDiagnosis: generateDifferentialDiagnosis(selectedCondition),
    correctInitialTests: generateCorrectTests(selectedCondition),
    correctTreatment: generateCorrectTreatment(selectedCondition, patient),
    correctFollowUp: ["Seguimiento en 2-4 semanas", "Monitoreo de síntomas", "Ajustes de medicación según respuesta"],
    educationPoints: [
      `La ${selectedCondition.toLowerCase()} requiere control regular`,
      "Importancia de la adherencia farmacológica",
      "Modificación de estilos de vida",
      "Seguimiento periódico de parámetros clínicos"
    ]
  };

  return clinicalCase;
}

function generateRealisticVitalSigns(patient: SyntheaPatient) {
  // Temperatura normal
  const temperature = 36.5 + (Math.random() - 0.5) * 0.8;

  // Presión arterial: aumenta con edad y si hay HTA
  const baseDBP = 70 + patient.age * 0.1;
  const baseSBP = 110 + patient.age * 0.5;
  const hasHypertension = patient.pastMedicalHistory.includes("Hipertensión");
  const sbp = baseSBP + (hasHypertension ? 20 : 0) + (Math.random() - 0.5) * 10;
  const dbp = baseDBP + (hasHypertension ? 10 : 0) + (Math.random() - 0.5) * 8;

  // Frecuencia cardíaca
  const heartRate = 60 + (Math.random() - 0.5) * 20;

  // Frecuencia respiratoria
  const respiratoryRate = 16 + (Math.random() - 0.5) * 4;

  // Saturación O2
  const hasREPOC = patient.pastMedicalHistory.includes("EPOC");
  const oxygenSaturation = (hasREPOC ? 94 : 98) + (Math.random() - 0.5) * 2;

  return {
    temperature: parseFloat(temperature.toFixed(1)),
    bloodPressure: `${Math.round(sbp)}/${Math.round(dbp)} mmHg`,
    heartRate: Math.round(heartRate),
    respiratoryRate: Math.round(respiratoryRate),
    oxygenSaturation: Math.round(oxygenSaturation)
  };
}

function generateHistoryOfPresentIllness(complaint: string, patient: SyntheaPatient): string {
  const duration = ["días", "semanas"];
  const onset = ["gradual", "súbito"];

  return `El paciente refiere ${complaint.toLowerCase()} de ${Math.floor(Math.random() * 20) + 1} ${
    duration[Math.floor(Math.random() * duration.length)]
  } de evolución ${onset[Math.floor(Math.random() * onset.length)]}. Niega síntomas asociados graves. ${
    patient.pastMedicalHistory.length > 0
      ? `Refiere control regular de sus condiciones de base (${patient.pastMedicalHistory.join(", ")}).`
      : ""
  }`;
}

function generatePhysicalExam(patient: SyntheaPatient, vitalSigns: any): string {
  return `Paciente ${patient.gender === "M" ? "varón" : "mujer"} de ${patient.age} años, IMC aproximado ${(
    18 + Math.random() * 15
  ).toFixed(1)}. Presión arterial: ${vitalSigns.bloodPressure}, FC: ${vitalSigns.heartRate} lpm, saturación O2: ${vitalSigns.oxygenSaturation}%. Exploración neurológica normal. Auscultación cardiopulmonar sin alteraciones. Abdomen blando, depresible, sin visceromegalias.`;
}

function generateRecommendedTests(condition: string): string[] {
  const testsMap: Record<string, string[]> = {
    "Diabetes tipo 2": ["Glucosa en ayunas", "HbA1c", "Perfil lipídico", "Creatinina", "Microalbuminuria"],
    "Hipertensión": ["Presión arterial ambulatoria", "ECG", "Ecocardiograma", "Creatinina"],
    "Dislipidemia": ["Perfil lipídico completo", "Glucosa", "TSH"],
    "Síndrome metabólico": ["Glucosa", "Perfil lipídico", "Presión arterial"],
    "EPOC": ["Espirometría", "Gasometría arterial", "Rx de tórax"],
    "default": ["Hemograma completo", "Glucosa", "Perfil lipídico"]
  };

  return testsMap[condition] || testsMap["default"];
}

function generateTreatmentOptions(condition: string): string[] {
  const treatmentMap: Record<string, string[]> = {
    "Diabetes tipo 2": ["Metformina", "Sulfonilureas", "GLP-1", "Insulina"],
    "Hipertensión": ["IECA", "ARA II", "Calcioantagonistas", "Diuréticos"],
    "Dislipidemia": ["Estatinas", "Ezetimiba", "PCSK9"],
    "EPOC": ["Broncodilatadores", "Corticoides inhalados", "Teofilina"],
    "default": ["Tratamiento farmacológico", "Modificación de estilos de vida"]
  };

  return treatmentMap[condition] || treatmentMap["default"];
}

function generateDifferentialDiagnosis(condition: string): string[] {
  const diffMap: Record<string, string[]> = {
    "Diabetes tipo 2": ["Intolerancia a la glucosa", "Diabetes tipo 1", "Diabetes secundaria"],
    "Hipertensión": ["Hipertensión secundaria", "Síndrome de bata blanca", "Hipertensión enmascarada"],
    "Dislipidemia": ["Hiperlipidemia familiar", "Dislipidemia secundaria"],
    "default": ["Otras causas", "Variante normal"]
  };

  return diffMap[condition] || diffMap["default"];
}

function generateCorrectTests(condition: string): string[] {
  return generateRecommendedTests(condition);
}

function generateCorrectTreatment(condition: string, patient: SyntheaPatient): string[] {
  const base = generateTreatmentOptions(condition);
  if (patient.pastMedicalHistory.length > 1) {
    return [...base, "Considerar interacciones medicamentosas"];
  }
  return base;
}

function generateReferralIndications(condition: string): string[] {
  const referralMap: Record<string, string[]> = {
    "Diabetes tipo 2": ["Endocrinología si mal control", "Oftalmología para screening", "Nefrología si compromiso renal"],
    "Hipertensión": ["Cardiología si HVI", "Nefrología si daño renal", "Neurología si accidente cerebrovascular"],
    "EPOC": ["Neumología si moderada-severa", "Cardiología si cor pulmonale"],
    "default": ["Especialista si no responde a tratamiento"]
  };

  return referralMap[condition] || referralMap["default"];
}
