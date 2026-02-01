import { PrismaClient } from "@prisma/client";
import { generateSyntheaPatients, syntheaToClinicalCase } from "../lib/synthea-simulator";
import { CLINICAL_CASES } from "../lib/clinical-cases-index";

const prisma = new PrismaClient();

async function importSyntheaCases() {
  console.log("🧪 Iniciando generación de casos Synthea...");

  // Generar 20 pacientes sintéticos
  const syntheaPatients = generateSyntheaPatients(20);
  console.log(`✓ Generados ${syntheaPatients.length} pacientes sintéticos`);

  // Convertir a ClinicalCase
  const newCases = syntheaPatients.map((patient, index) =>
    syntheaToClinicalCase(patient, index)
  );

  // Agregar a índice global
  const allCases = {
    ...CLINICAL_CASES,
    ...Object.fromEntries(newCases.map(c => [c.id, c]))
  };

  console.log(`✓ Convertidos ${newCases.length} casos al formato ClinicalCase`);

  // Guardar en BD (crear tabla de casos sintéticos)
  // Por ahora los guardamos en memoria, pero se pueden persistir en Prisma

  console.log("\n📋 Resumen de casos generados:");
  newCases.slice(0, 5).forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.patient.name} - ${c.correctDiagnosis[0]}`);
  });

  console.log(`\n✅ Total de casos disponibles: ${Object.keys(allCases).length}`);
  console.log("   - 5 casos base de medicina de familia");
  console.log(`   - ${newCases.length} casos generados con Synthea\n`);

  await prisma.$disconnect();
}

importSyntheaCases().catch(console.error);
