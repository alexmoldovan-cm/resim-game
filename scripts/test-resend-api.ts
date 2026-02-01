import fs from 'fs';
import path from 'path';

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

async function testResendAPI() {
  try {
    console.log('🔍 Probando API de Resend...\n');
    console.log(`📧 Email enviado desde: onboarding@resend.dev`);
    console.log(`📧 Email destino: test-verify@example.com`);
    console.log(`🔑 API Key: ${process.env.RESEND_API_KEY?.substring(0, 10)}...`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ResidentSim <onboarding@resend.dev>',
        to: 'test-verify@example.com',
        subject: 'Test de Verificación - ResidentSim',
        html: '<h1>Test email</h1><p>Si ves esto, Resend funciona correctamente.</p>',
      }),
    });

    const data = await response.json();
    
    console.log('\n📊 Respuesta de Resend:');
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ ¡API de Resend funciona correctamente!');
    } else {
      console.log('\n❌ Error en la API de Resend');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testResendAPI();
