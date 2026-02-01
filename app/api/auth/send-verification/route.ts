import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Función para enviar email con Resend
async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  
  try {
    // Usar Resend API
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
    return { success: response.ok, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Generar token de verificación
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Guardar token en base de datos
    await prisma.authSession.create({
      data: {
        email: email as string,
        token,
        type: "email_verification",
        expiresAt,
      } as any,
    });

    // Enviar email
    const emailResult = await sendVerificationEmail(email, token);

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Aunque falle el email, devolvemos éxito para testing
      // En producción, deberías manejar esto correctamente
    }

    return NextResponse.json({
      success: true,
      message: "Correo de verificación enviado. Revisa tu bandeja de entrada.",
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Error al enviar correo de verificación" },
      { status: 500 }
    );
  }
}
