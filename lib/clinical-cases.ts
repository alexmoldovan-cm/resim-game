// Casos clínicos realistas de medicina de familia con protocolos clínicos

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F";
  occupation: string;
  pastMedicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  familyHistory: string[];
  socialHistory: {
    smoking: "never" | "current" | "former";
    packYears?: number;
    alcohol: "none" | "moderate" | "heavy";
    otherSubstances: string[];
  };
}

export interface ClinicalCase {
  id: string;
  name: string;
  specialization: "medicina_familia" | "cardiologia" | "neumologia" | "neurologia" | "endocrinologia";
  patient: PatientProfile;
  presentingComplaint: string;
  historyOfPresentIllness: string;
  vitalSigns: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
  physicalExam: string;
  initialAssessment: string;
  
  // Clinical guidelines reference
  guidelines: {
    source: string; // e.g., "AAFP", "GPC Española", "UpToDate"
    conditionCode: string; // ICD-10
    recommendedTests: string[];
    treatmentOptions: string[];
    referralIndications: string[];
  };
  
  // Evaluación correcta
  correctDiagnosis: string[];
  correctDifferentialDiagnosis: string[];
  correctInitialTests: string[];
  correctTreatment: string[];
  correctFollowUp: string[];
  
  educationPoints: string[];
}

// CASO 1: Hipertensión Arterial en Medicina de Familia
export const CASE_HYPERTENSION: ClinicalCase = {
  id: "hta-primary-001",
  name: "Hipertensión Arterial Sistémica",
  specialization: "medicina_familia",
  patient: {
    id: "P001",
    name: "Carlos",
    age: 58,
    gender: "M",
    occupation: "Gerente de empresa",
    pastMedicalHistory: ["Dislipidemia", "Sobrepeso (IMC 28.5)"],
    currentMedications: ["Simvastatina 20mg/día"],
    allergies: [],
    familyHistory: ["Padre falleció de IAM a los 65 años", "Madre HTA"],
    socialHistory: {
      smoking: "former",
      packYears: 20,
      alcohol: "moderate",
      otherSubstances: []
    }
  },
  presentingComplaint: "Control de presión arterial. Refiere dolores de cabeza ocasionales",
  historyOfPresentIllness: "Paciente de 58 años que acude a consulta de seguimiento. Refiere haber notado en mediciones caseras presiones arteriales elevadas (150-160 mmHg sistólica). Niega disnea, dolor torácico o síncope. Presenta cefaleas ocasionales (2-3 veces por semana) de carácter occipital, leve intensidad, sin relación clara con las cifras de TA.",
  vitalSigns: {
    temperature: 36.8,
    bloodPressure: "152/96",
    heartRate: 82,
    respiratoryRate: 14,
    oxygenSaturation: 98
  },
  physicalExam: "Paciente consciente y orientado. Peso 92kg, talla 1.82m (IMC 27.8). Exploración cardiovascular: pulsos regulares, sin soplos. Auscultación pulmonar normal. Abdomen blando, indoloro. EEII sin edemas.",
  initialAssessment: "Hipertensión arterial sistémica (estadio 2 según ESC/EAS). Paciente con factores de riesgo cardiovascular: edad, sexo, HTA, dislipidemia, historia familiar de ECV temprana.",
  guidelines: {
    source: "ESC/EAS 2021, AAFP, GPC Española 2022",
    conditionCode: "I10",
    recommendedTests: [
      "ECG de reposo",
      "Análisis: glucosa, creatinina, filtrado glomerular, potasio, colesterol total, HDL, LDL, triglicéridos",
      "Proteinuria (tira de orina o microalbuminuria si DM o ERC)",
      "MAPA o automedición de presión"
    ],
    treatmentOptions: [
      "Modificaciones en estilo de vida (sal <5g/día, ejercicio 150min/semana, pérdida peso, reducir alcohol)",
      "Fármaco: IECA o ARA II como primera línea",
      "Alternativa: Calcioantagonista o diurético tiazídico"
    ],
    referralIndications: [
      "HTA resistente tras ajuste de 3+ fármacos",
      "Daño de órgano diana",
      "Síntomas sugestivos de HTA secundaria"
    ]
  },
  correctDiagnosis: [
    "hipertensión arterial",
    "hta",
    "hipertensión",
    "hta estadio 2",
    "hipertensión sistémica"
  ],
  correctDifferentialDiagnosis: [
    "hta primaria",
    "hta esencial",
    "hipertensión blanca de bata"
  ],
  correctInitialTests: [
    "ecg",
    "análisis de sangre",
    "glucosa",
    "creatinina",
    "potasio",
    "colesterol",
    "ldl",
    "triglicéridos",
    "mapa",
    "automedición",
    "proteinuria"
  ],
  correctTreatment: [
    "modificaciones en estilo de vida",
    "dieta sal",
    "ejercicio",
    "pérdida de peso",
    "ieca",
    "ara ii",
    "calcioantagonista",
    "diurético tiazídico",
    "ramipril",
    "losartán",
    "amlodipino"
  ],
  correctFollowUp: [
    "revisión en 2 semanas",
    "control de presión",
    "valorar respuesta a tratamiento",
    "ajuste de dosis",
    "educación sanitaria"
  ],
  educationPoints: [
    "La HTA es asintomática en la mayoría de casos (silent killer)",
    "Importancia del MAPA para descartar síndrome de bata blanca",
    "Modificaciones del estilo de vida son primera línea incluso con fármacos",
    "Considerar daño de órgano diana (ECG, proteinuria, FG)",
    "Objetivo TA <130/80 en pacientes con factores de riesgo"
  ]
};

// CASO 2: Diabetes Tipo 2 no diagnosticada
export const CASE_DIABETES_TYPE2: ClinicalCase = {
  id: "dm2-primary-001",
  name: "Diabetes Tipo 2 en Medicina de Familia",
  specialization: "medicina_familia",
  patient: {
    id: "P002",
    name: "María",
    age: 52,
    gender: "F",
    occupation: "Ama de casa",
    pastMedicalHistory: ["Sobrepeso (IMC 31)", "Síndrome de ovario poliquístico en antecedentes"],
    currentMedications: ["Anticonceptivos hace 5 años"],
    allergies: ["Penicilina"],
    familyHistory: ["Madre DM2 diagnosticada a los 55 años", "Padre HTA"],
    socialHistory: {
      smoking: "never",
      alcohol: "none",
      otherSubstances: []
    }
  },
  presentingComplaint: "Cansancio desde hace 2 meses. Aumento de sed y micción",
  historyOfPresentIllness: "Mujer de 52 años que acude a consulta refiriendo astenia progresiva desde hace 2 meses. Asocia poliuria (oriña más de 5-6 veces al día), polidipsia (bebe agua constantemente). Ha notado visión borrosa ocasional. Refiere prurito vulvar recurrente. Niega fiebre, pérdida involuntaria de peso (aunque refiere estar más cansada para hacer tareas). Sin síntomas respiratorios ni digestivos.",
  vitalSigns: {
    temperature: 36.7,
    bloodPressure: "134/82",
    heartRate: 78,
    respiratoryRate: 15,
    oxygenSaturation: 99
  },
  physicalExam: "Paciente consciente y orientada. Peso 78kg, talla 1.62m (IMC 29.8, sobrepeso). Exploración general sin hallazgos relevantes. Exploración oftalmológica: no se observan cambios en papila. Exploración neurológica: sensibilidad normal en EEII. Reflejo patelar y aquíleo presentes. Dermopatología: hiperqueratosis en codos.",
  initialAssessment: "Sospecha de diabetes mellitus tipo 2. Presentación clásica: poliuria, polidipsia, astenia. Factores de riesgo: edad >45, sobrepeso, antecedentes familiares de DM2.",
  guidelines: {
    source: "ADA 2024, AAFP, GPC Española Endocrinología",
    conditionCode: "E11",
    recommendedTests: [
      "Glucosa basal en ayunas",
      "HbA1c",
      "Glucosa casual o test de tolerancia oral a la glucosa (TTOG)",
      "Análisis: creatinina, FG, potasio, perfil lipídico",
      "Urianálisis con búsqueda de glucosa y proteína",
      "ECG de reposo",
      "Exploración oftalmológica"
    ],
    treatmentOptions: [
      "Cambios en estilo de vida: dieta mediterránea, ejercicio >150min/semana, pérdida peso",
      "Metformina 500-1000mg/día (si no hay contraindicaciones)",
      "Valorar otros antidiabéticos según comorbilidades"
    ],
    referralIndications: [
      "Retinopatía diabética",
      "Nefropatía avanzada (FG<30)",
      "Complicaciones cardiovasculares",
      "Necesidad de insulina en DM2"
    ]
  },
  correctDiagnosis: [
    "diabetes mellitus tipo 2",
    "dm2",
    "diabetes",
    "hiperglucemia",
    "diabetes no insulinodependiente"
  ],
  correctDifferentialDiagnosis: [
    "diabetes tipo 2",
    "alteración de la glucosa en ayunas",
    "intolerancia a la glucosa"
  ],
  correctInitialTests: [
    "glucosa basal",
    "hba1c",
    "ttog",
    "glucosa casual",
    "creatinina",
    "filtrado glomerular",
    "potasio",
    "colesterol",
    "ldl",
    "triglicéridos",
    "hdl",
    "urianálisis",
    "ecg",
    "oftalmología"
  ],
  correctTreatment: [
    "cambios en estilo de vida",
    "dieta mediterránea",
    "ejercicio",
    "pérdida de peso",
    "educación diabética",
    "metformina",
    "antidiabéticos orales",
    "educación en autocontrol"
  ],
  correctFollowUp: [
    "seguimiento en 4-6 semanas",
    "educar sobre signos de hipoglucemia",
    "control de factores de riesgo cardiovascular",
    "revisión anual con oftalmología",
    "control anual de microalbuminuria",
    "cribado de neuropatía diabética"
  ],
  educationPoints: [
    "DM2 es enfermedad progresiva que requiere seguimiento",
    "Complicaciones microvasculares: retinopatía, nefropatía, neuropatía",
    "Complicaciones macrovasculares: ictus, IAM, enfermedad arterial periférica",
    "Importancia de HbA1c objetivo <7% (individualizarlo)",
    "Estilo de vida es fundamental incluso con medicación"
  ]
};

// CASO 3: Depresión en Medicina de Familia
export const CASE_DEPRESSION: ClinicalCase = {
  id: "depression-primary-001",
  name: "Depresión Mayor en Medicina de Familia",
  specialization: "medicina_familia",
  patient: {
    id: "P003",
    name: "Antonio",
    age: 47,
    gender: "M",
    occupation: "Profesor",
    pastMedicalHistory: ["Episodio depresivo mayor hace 15 años (tratado)", "Insomnia crónica"],
    currentMedications: [],
    allergies: [],
    familyHistory: ["Madre con historia de depresión", "Hermana con ansiedad"],
    socialHistory: {
      smoking: "current",
      packYears: 20,
      alcohol: "moderate",
      otherSubstances: []
    }
  },
  presentingComplaint: "Lleva un mes sintiéndose triste y sin energía",
  historyOfPresentIllness: "Paciente de 47 años que acude refiriendo ánimo deprimido persistente hace 4 semanas. Asocia pérdida de interés en actividades (no le apetece ver a amigos, ya no disfruta leyendo). Fatiga constante, cansancio desproporcionado. Insomnio de mantenimiento (se despierta a las 4-5 AM y no puede volver a dormir). Refiere culpa por no ser buen padre, sensación de desesperanza sobre su futuro. Niega ideación suicida franca pero refiere 'a veces pienso que sería mejor no estar aquí'. Síntomas presentes casi todos los días.",
  vitalSigns: {
    temperature: 36.8,
    bloodPressure: "124/78",
    heartRate: 74,
    respiratoryRate: 14,
    oxygenSaturation: 98
  },
  physicalExam: "Paciente consciente, orientado. Aspecto descuidado (ropa arrugada, falta de aseo). Expresión facial triste. Psicomotricidad lentificada. Contacto visual escaso. Discurso lentificado. No hay signos de alerta (autolesiones, comportamiento extraño).",
  initialAssessment: "Sospecha de Depresión Mayor. Cumple criterios DSM-5: ánimo deprimido, pérdida de interés, fatiga, cambios en sueño, culpa, desesperanza. Duración >2 semanas. Impacto funcional significativo.",
  guidelines: {
    source: "APA DSM-5, AAFP, GPC Española Salud Mental",
    conditionCode: "F32.9",
    recommendedTests: [
      "Escala PHQ-9 (Patient Health Questionnaire)",
      "GAD-7 (para evaluar ansiedad comórbida)",
      "Evaluación de riesgo suicida detallada",
      "TSH (descartar hipotiroidismo)",
      "Hemoglobina y hematocrito (descartar anemia)",
      "Evaluación de consumo de alcohol/drogas"
    ],
    treatmentOptions: [
      "Psicoterapia (primera línea para depresión leve-moderada)",
      "ISRS: Sertralina 50-100mg/día, Escitalopram 10-20mg/día",
      "ATC: Amitriptilina (si hay insomnio comórbido)",
      "Apoyo psicosocial, cambios de estilo de vida"
    ],
    referralIndications: [
      "Riesgo suicida moderado-alto",
      "Depresión resistente al tratamiento",
      "Necesidad de ingreso hospitalario",
      "Comorbilidad con otra enfermedad mental grave"
    ]
  },
  correctDiagnosis: [
    "depresión mayor",
    "trastorno depresivo",
    "depresión",
    "episodio depresivo mayor",
    "trastorno depresivo mayor"
  ],
  correctDifferentialDiagnosis: [
    "depresión primaria",
    "depresión secundaria a enfermedad",
    "distimia",
    "trastorno adaptativo"
  ],
  correctInitialTests: [
    "phq-9",
    "gad-7",
    "evaluación de riesgo suicida",
    "tsh",
    "hemoglobina",
    "hematocrito",
    "evaluación de sustancias"
  ],
  correctTreatment: [
    "psicoterapia",
    "terapia cognitiva conductual",
    "isrs",
    "sertralina",
    "escitalopram",
    "paroxetina",
    "actividad física",
    "apoyo psicosocial",
    "cambios estilo de vida"
  ],
  correctFollowUp: [
    "seguimiento en 2 semanas",
    "evaluación de respuesta a tratamiento",
    "efecto adverse monitoring",
    "seguimiento mensual",
    "derivación a psicología/psiquiatría si no mejora",
    "evaluación de riesgo suicida en cada visita"
  ],
  educationPoints: [
    "Depresión es enfermedad médica, no debilidad",
    "Tratamiento es efectivo en 80-90% de casos",
    "Combinación de fármacos + psicoterapia es más efectiva",
    "ISRS tienen latencia de 4-6 semanas para efecto",
    "Importancia de adherencia al tratamiento",
    "Prevención de recurrencia con seguimiento"
  ]
};

// CASO 4: Infección Respiratoria - Bronquitis Aguda
export const CASE_ACUTE_BRONCHITIS: ClinicalCase = {
  id: "bronchitis-primary-001",
  name: "Bronquitis Aguda en Medicina de Familia",
  specialization: "medicina_familia",
  patient: {
    id: "P004",
    name: "Isabel",
    age: 64,
    gender: "F",
    occupation: "Jubilada",
    pastMedicalHistory: ["EPOC leve", "HTA controlada", "Hipercolesterolemia"],
    currentMedications: ["Enalapril 10mg/día", "Atorvastatina 20mg/día", "Salbutamol inhalado PRN"],
    allergies: [],
    familyHistory: ["Hermano EPOC severo"],
    socialHistory: {
      smoking: "former",
      packYears: 40,
      alcohol: "none",
      otherSubstances: []
    }
  },
  presentingComplaint: "Tos de 5 días de evolución",
  historyOfPresentIllness: "Mujer de 64 años que acude por tos de 5 días de evolución. Comenzó hace una semana con catarro de vías altas (congestión nasal, estornudos) que cedió parcialmente, pero desarrolló tos inicialmente seca que ahora es productiva con expectoración de mucosidad blanco-grisácea. Niega hemoptisis. Refiere disnea leve con esfuerzos. Febrícula hace 2 días (37.5ºC). Ha dormido mal por la tos. Toma salbutamol inhalado cuando tiene tos (2-3 veces/día).",
  vitalSigns: {
    temperature: 37.3,
    bloodPressure: "138/84",
    heartRate: 88,
    respiratoryRate: 18,
    oxygenSaturation: 96
  },
  physicalExam: "Paciente consciente y orientada. Afectación del estado general leve. Auscultación pulmonar: crepitantes espirados bilaterales, sin sibilancias. Exploración ORL: congestión nasal residual. Frecuencia cardíaca regular. Resto de exploración normal.",
  initialAssessment: "Bronquitis aguda (probablemente viral). Paciente con EPOC de base, por lo que requiere vigilancia de exacerbación.",
  guidelines: {
    source: "AAFP, GPC Española Respiratorio, GOLD",
    conditionCode: "J20.9",
    recommendedTests: [
      "No necesarios en mayoría de casos (diagnóstico clínico)",
      "Radiografía de tórax si: síntomas >3 semanas, sospecha de neumonía, edad >65 con comorbilidades",
      "Oximetría de pulso (importante en EPOC)"
    ],
    treatmentOptions: [
      "Tratamiento sintomático: paracetamol, hidratación",
      "Antitusígenos (no suprime tos productiva)",
      "Broncodilatadores si hay broncoespasmo (salbutamol)",
      "NO antibióticos a menos que evidencia de infección bacteriana",
      "Considerar corticoides inhalados si EPOC exacerbada"
    ],
    referralIndications: [
      "Disnea severa",
      "Saturación O2 <90%",
      "Sospecha de neumonía",
      "Exacerbación EPOC severa"
    ]
  },
  correctDiagnosis: [
    "bronquitis aguda",
    "infección de vías aéreas inferiores",
    "traqueobronquitis",
    "bronquitis viral"
  ],
  correctDifferentialDiagnosis: [
    "neumonía",
    "exacerbación epoc",
    "asma",
    "traqueítis"
  ],
  correctInitialTests: [
    "oximetría de pulso",
    "radiografía de tórax (si indicado)"
  ],
  correctTreatment: [
    "tratamiento sintomático",
    "paracetamol",
    "hidratación",
    "reposo",
    "salbutamol inhalado",
    "educación para la tos",
    "no antibióticos (viral)"
  ],
  correctFollowUp: [
    "revisión en 7-10 días si no mejora",
    "radiografía de tórax si tos persiste >3 semanas",
    "educación sobre signos de alarma (disnea severa, hemoptisis)",
    "reforzar vacunación gripe/neumococo"
  ],
  educationPoints: [
    "Mayoría bronquitis aguda son virales, no requieren antibióticos",
    "Tos puede persistir 3-4 semanas post-infección (postusivo)",
    "Hidratación y reposo son pilares del tratamiento",
    "Antibióticos NO aceleran recuperación en bronquitis viral",
    "Importante control de EPOC base para evitar exacerbación"
  ]
};

// CASO 5: Dismenorrea Primaria
export const CASE_DYSMENORRHEA: ClinicalCase = {
  id: "dysmenorrhea-primary-001",
  name: "Dismenorrea Primaria en Medicina de Familia",
  specialization: "medicina_familia",
  patient: {
    id: "P005",
    name: "Laura",
    age: 28,
    gender: "F",
    occupation: "Enfermera",
    pastMedicalHistory: [],
    currentMedications: ["Anticonceptivos (levonorgestrel-etinilestradiol)"],
    allergies: [],
    familyHistory: ["Madre con dismenorrea"],
    socialHistory: {
      smoking: "never",
      alcohol: "moderate",
      otherSubstances: []
    }
  },
  presentingComplaint: "Dolor intenso durante la menstruación",
  historyOfPresentIllness: "Mujer de 28 años que acude refiriendo dolor menstrual intenso desde la menarquia. Describe dolor cólico en hipogastrio, irradiado a zona lumbar y muslos. Comienza 12h antes del inicio del sangrado y cede en 48h. Intensidad 8-9/10, requiere fármacos. Asocia náuseas y, ocasionalmente, vómitos. En este ciclo, además de tomar anticonceptivos, ha tomado ibuprofeno 600mg cada 6h sin mejoría significativa. Ha perdido días de trabajo. El dolor no interfiere con relaciones sexuales entre ciclos.",
  vitalSigns: {
    temperature: 36.8,
    bloodPressure: "118/74",
    heartRate: 82,
    respiratoryRate: 14,
    oxygenSaturation: 99
  },
  physicalExam: "Paciente consciente y orientada. Afectación del estado general moderada (por dolor). Exploración abdominal: leve defensa a palpación en hipogastrio, sin masas palpables, sin peritonismo. Exploración ginecológica no realizada (fuera del ciclo menstrual). Sin hallazgos relevantes en resto de exploración.",
  initialAssessment: "Dismenorrea primaria. Patrón característico: dolor cólico perimenstrual sin patología orgánica. Severidad moderada-severa.",
  guidelines: {
    source: "ACOG, AAFP, GPC Española Ginecología",
    conditionCode: "N94.4",
    recommendedTests: [
      "Diagnóstico clínico, no requiere pruebas en casos típicos",
      "Ecografía pélvica si: atípica presentación, hallazgos anormales en exploración, fallo de tratamiento"
    ],
    treatmentOptions: [
      "AINES: Ibuprofeno 400-600mg cada 6-8h, Naproxeno 500mg cada 12h",
      "Paracetamol 1000mg cada 6-8h (menos efectivo)",
      "Anticonceptivos hormonales (reduce síntomas 50-70%)",
      "Calor local (almohadilla térmica)",
      "Ejercicio regular",
      "Técnicas de relajación"
    ],
    referralIndications: [
      "Sospecha de endometriosis",
      "Fallo de tratamiento conservador",
      "Aparición de síntomas después de 25 años",
      "Hallazgos en exploración física"
    ]
  },
  correctDiagnosis: [
    "dismenorrea primaria",
    "dolor menstrual",
    "dismenorrea",
    "menorragia"
  ],
  correctDifferentialDiagnosis: [
    "dismenorrea primaria",
    "endometriosis",
    "miomas uterinos",
    "enfermedad pélvica inflamatoria"
  ],
  correctInitialTests: [
    "diagnóstico clínico",
    "ecografía pélvica (si indicado)"
  ],
  correctTreatment: [
    "aines",
    "ibuprofeno",
    "naproxeno",
    "paracetamol",
    "anticonceptivos hormonales",
    "calor local",
    "ejercicio",
    "técnicas de relajación"
  ],
  correctFollowUp: [
    "seguimiento en 1-2 ciclos",
    "valorar respuesta a tratamiento",
    "ajuste de dosis si es necesario",
    "derivación a ginecología si fallo terapéutico"
  ],
  educationPoints: [
    "Dismenorrea primaria es muy común (50% mujeres en edad fértil)",
    "AINES son primera línea (efectivos en 80% si se inician antes del dolor)",
    "Anticonceptivos hormonales previenen ovulación (reducen síntomas)",
    "Ejercicio regular mejora síntomas",
    "Estrés no causa dismenorrea pero la puede empeorar"
  ]
};
