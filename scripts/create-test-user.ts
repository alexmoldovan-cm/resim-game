import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Cargar variables del archivo .env.local manualmente
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim()) {
    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    acc[key.trim()] = value;
  }
  return acc;
}, {} as Record<string, string>);

// Establecer variables de entorno
Object.entries(envVars).forEach(([key, value]) => {
  process.env[key] = value;
});

const prisma = new PrismaClient();

async function main() {
  try {
    // Datos del usuario de prueba
    const testEmail = "test@example.com";
    const testPassword = "password123";
    const testUsername = "testuser";

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (existingUser) {
      console.log("✓ El usuario de prueba ya existe:");
      console.log(`  Email: ${existingUser.email}`);
      console.log(`  Username: ${existingUser.username}`);
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        username: testUsername,
        emailVerified: true, // Marcar como verificado para facilitar pruebas
        verificationCode: null,
      },
    });

    console.log("✓ Usuario de prueba creado exitosamente:");
    console.log(`  Email: ${user.email}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  ID: ${user.id}`);
    console.log("\n📝 Credenciales para login:");
    console.log(`  Email: ${testEmail}`);
    console.log(`  Contraseña: ${testPassword}`);
  } catch (error) {
    console.error("❌ Error al crear el usuario:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
