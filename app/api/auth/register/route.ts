import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

// Función para enviar email con Resend
async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ResidentSim <onboarding@resend.dev>",
        to: email,
        subject: "Verifica tu email - ResidentSim",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">¡Bienvenido a ResidentSim!</h2>
            <p>Para completar tu registro, haz clic en el siguiente enlace para verificar tu email:</p>
            <p style="margin: 20px 0;">
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verificar Email
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">O copia este enlace en tu navegador:</p>
            <p style="background-color: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
              ${verificationUrl}
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Este enlace expirará en 24 horas.
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Resend API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });
    }
    
    return { success: response.ok, data };
  } catch (error: any) {
    console.error("Error sending email - Network/Fetch Error:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json() as RegisterRequest;

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar token de verificación (32 caracteres hex)
    const verificationToken = randomBytes(32).toString("hex");

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || email.split("@")[0],
        emailVerified: false
      }
    });

    // Crear sesión de verificación
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    await prisma.authSession.create({
      data: {
        email,
        token: verificationToken,
        type: "email_verification",
        expiresAt,
      },
    });

    // Intentar enviar email con Resend
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      console.error("❌ Error enviando email a:", email, "- Data:", emailResult.data);
      // No fallar si el email no se envía - en desarrollo es normal
    } else {
      console.log("✅ Email de verificación enviado exitosamente a:", email);
    }

    return NextResponse.json({
      success: true,
      message: emailResult.success 
        ? "¡Registrado! Revisa tu email para verificar tu cuenta."
        : "Usuario registrado. Usa el token de verificación enviado.",
      userId: user.id,
      email: user.email,
      emailSent: emailResult.success
    }, { status: 201 });

  } catch (error) {
    console.error("❌ ERROR EN REGISTRO:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
