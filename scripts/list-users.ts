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
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n📊 Usuarios registrados:');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
    } else {
      console.log(`Total: ${users.length} usuario(s)\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Verificado: ${user.emailVerified ? '✅ Sí' : '❌ No'}`);
        console.log(`   Creado: ${new Date(user.createdAt).toLocaleString('es-ES')}`);
        console.log();
      });
    }

    console.log('═══════════════════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
