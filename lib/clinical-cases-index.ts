import {
  CASE_HYPERTENSION,
  CASE_DIABETES_TYPE2,
  CASE_DEPRESSION,
  CASE_ACUTE_BRONCHITIS,
  CASE_DYSMENORRHEA,
  ClinicalCase
} from "./clinical-cases";
import { generateSyntheaPatients, syntheaToClinicalCase } from "./synthea-simulator";

// Generar casos Synthea (20 adicionales)
const syntheaPatients = generateSyntheaPatients(20);
const synthetaCases = syntheaPatients.reduce((acc, patient, index) => {
  const caseData = syntheaToClinicalCase(patient, index);
  acc[caseData.id] = caseData;
  return acc;
}, {} as Record<string, ClinicalCase>);

// Índice de todos los casos clínicos
export const CLINICAL_CASES: Record<string, ClinicalCase> = {
  // Casos base de medicina de familia
  "hta-primary-001": CASE_HYPERTENSION,
  "dm2-primary-001": CASE_DIABETES_TYPE2,
  "depression-primary-001": CASE_DEPRESSION,
  "bronchitis-primary-001": CASE_ACUTE_BRONCHITIS,
  "dysmenorrhea-primary-001": CASE_DYSMENORRHEA,
  // Casos generados con Synthea
  ...synthetaCases
};
// Casos disponibles para el dashboard
const BASE_CASES = [
  {
    id: "hta-primary-001",
    name: "Hipertensión Arterial Sistémica",
    description: "Paciente con control de presión elevada. Factores de riesgo cardiovascular presentes.",
    patient: "Carlos, 58 años",
    specialization: "medicina_familia"
  },
  {
    id: "dm2-primary-001",
    name: "Diabetes Tipo 2",
    description: "Mujer con síntomas de hiperglucemia. Poliuria, polidipsia y astenia.",
    patient: "María, 52 años",
    specialization: "medicina_familia"
  },
  {
    id: "depression-primary-001",
    name: "Depresión Mayor",
    description: "Paciente con ánimo deprimido, fatiga y cambios en patrones de sueño.",
    patient: "Antonio, 47 años",
    specialization: "medicina_familia"
  },
  {
    id: "bronchitis-primary-001",
    name: "Bronquitis Aguda",
    description: "Paciente con tos productiva y febrícula. Antecedente de EPOC.",
    patient: "Isabel, 64 años",
    specialization: "medicina_familia"
  },
  {
    id: "dysmenorrhea-primary-001",
    name: "Dismenorrea Primaria",
    description: "Mujer con dolor menstrual severo que afecta su funcionamiento",
    patient: "Laura, 28 años",
    specialization: "medicina_familia"
  }
];

// Agregar casos Synthea a la lista disponible (hasta 25 casos totales)
export const AVAILABLE_CASES = [
  ...BASE_CASES,
  ...Object.values(synthetaCases)
    .slice(0, 20)
    .map((c) => ({
      id: c.id,
      name: c.name,
      description: `${c.patient.name}, ${c.patient.age} años. ${c.correctDiagnosis[0]}`,
      patient: `${c.patient.name}, ${c.patient.age} años`,
      specialization: "medicina_familia"
    }))
];

export function getClinicalCaseById(caseId: string): ClinicalCase | null {
  return CLINICAL_CASES[caseId] || null;
}

export function getAvailableCases() {
  return AVAILABLE_CASES;
}
