import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

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
    // Borrar usuarios no verificados
    const result = await prisma.user.deleteMany({
      where: {
        emailVerified: false,
      },
    });

    console.log(`\n✅ Se eliminaron ${result.count} usuario(s) no verificado(s)`);
    
    // Mostrar usuarios restantes
    const remainingUsers = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
        emailVerified: true,
      },
    });

    console.log('\n📋 Usuarios restantes:');
    console.log('═══════════════════════════════════════════════════════════');
    remainingUsers.forEach((user) => {
      console.log(`• ${user.email} (${user.username}) - ${user.emailVerified ? '✅ Verificado' : '❌ No verificado'}`);
    });
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
