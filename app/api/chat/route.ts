import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClinicalCase } from "@/lib/clinical-cases";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Message {
  role: "doctor" | "paciente";
  content: string;
}

interface ChatResponse {
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages, caseContext } = await req.json() as { 
      messages: Message[];
      caseContext?: ClinicalCase;
    };

    // Validar que hay un API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada" },
        { status: 500 }
      );
    }

    // Construir instrucción del sistema basada en el contexto clínico
    let systemInstruction = `Eres un paciente en una simulación médica educativa. Tu rol es responder realísticamente a las preguntas y acciones del médico.`;
    
    if (caseContext) {
      const { patient, presentingComplaint, historyOfPresentIllness, vitalSigns, physicalExam } = caseContext;
      
      systemInstruction = `Eres ${patient.name}, un(a) paciente de ${patient.age} años con los siguientes datos:

**Antecedentes:**
- Ocupación: ${patient.occupation}
- Medicaciones actuales: ${patient.currentMedications.length > 0 ? patient.currentMedications.join(", ") : "Ninguna"}
- Alergias: ${patient.allergies.length > 0 ? patient.allergies.join(", ") : "No conocidas"}
- Antecedentes médicos: ${patient.pastMedicalHistory.length > 0 ? patient.pastMedicalHistory.join(", ") : "Sin antecedentes relevantes"}

**Presentación actual:**
- Queja principal: ${presentingComplaint}
- Historia de la enfermedad actual: ${historyOfPresentIllness}

**Signos vitales:**
- Temperatura: ${vitalSigns.temperature}°C
- Presión arterial: ${vitalSigns.bloodPressure}
- Frecuencia cardíaca: ${vitalSigns.heartRate} lpm
- Frecuencia respiratoria: ${vitalSigns.respiratoryRate} rpm
- Saturación O2: ${vitalSigns.oxygenSaturation}%

**Examen físico:**
${physicalExam}

Mantén coherencia con estos datos. Responde brevemente como lo haría un paciente real. Si el médico pregunta por síntomas, examen físico o historia, responde basándote en la información arriba. Sé cooperativo pero realista con tus síntomas y limitaciones.`;
    }

    // Obtener el modelo con system instruction
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction
    });

    // Procesar historial: convertir formato de la aplicación al formato de Gemini
    const historyMessages = messages.slice(0, -1); // Todos excepto el último
    
    // Construir el historial respetando la alternancia user/model de Gemini
    const formattedHistory = [];
    let lastRole: "user" | "model" | null = null;
    
    for (const msg of historyMessages) {
      const currentRole = msg.role === "doctor" ? "user" : "model";
      
      // Gemini requiere que roles se altern: user, model, user, model...
      // Si el primer mensaje no es 'user', lo omitimos
      if (formattedHistory.length === 0 && currentRole !== "user") {
        continue; // Saltamos si no es user
      }
      
      // Omitir si dos mensajes seguidos tienen el mismo rol (no debe pasar pero por seguridad)
      if (lastRole === currentRole) {
        continue;
      }
      
      formattedHistory.push({
        role: currentRole,
        parts: [{ text: msg.content }],
      });
      lastRole = currentRole;
    }

    // Iniciar sesión de chat con historial válido
    const chat = model.startChat({
      history: formattedHistory,
    });

    // El último mensaje es el que envía el doctor
    const lastMessage = messages[messages.length - 1]?.content;
    
    if (!lastMessage) {
      return NextResponse.json(
        { error: "No se proporcionó mensaje" },
        { status: 400 }
      );
    }

    // Enviar mensaje y obtener respuesta
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    const response: ChatResponse = {
      content: text
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("❌ ERROR EN CHAT API:", error);
    
    // Proporcionar feedback útil según el tipo de error
    let errorMessage = error.message || "Error desconocido";
    
    if (error.message?.includes("API key")) {
      errorMessage = "Error de autenticación: Verifica que GEMINI_API_KEY esté configurada";
    } else if (error.message?.includes("404") || error.message?.includes("not found")) {
      errorMessage = "Modelo no encontrado: Intenta con 'gemini-1.5-flash' o 'gemini-2.0-flash'";
    } else if (error.message?.includes("quota")) {
      errorMessage = "Cuota de API excedida: Espera un momento e intenta de nuevo";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}