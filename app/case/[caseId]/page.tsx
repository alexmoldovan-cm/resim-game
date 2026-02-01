"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { SimilarCasesSuggestion } from "@/components/similar-cases-suggestion";
import { EducationalContent } from "@/components/educational-content";
import { getClinicalCaseById } from "@/lib/clinical-cases-index";
import { ClinicalCase } from "@/lib/clinical-cases";

interface StepEvaluation {
  stepType: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  explanation: string;
}

type EvaluationStep = "diagnosis" | "differential" | "tests" | "treatment" | "followup" | "completed";

interface Message {
  role: "doctor" | "paciente";
  content: string;
  evaluation?: any;
  stepType?: EvaluationStep;
}

interface SimilarCase {
  id: string;
  name: string;
  specialization: string;
  presentingComplaint: string;
}

export default function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [clinicalCase, setClinicalCase] = useState<ClinicalCase | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [caseCompleted, setCaseCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState<EvaluationStep>("diagnosis");
  const [stepScores, setStepScores] = useState({
    diagnosis: 0,
    differential: 0,
    tests: 0,
    treatment: 0,
    followup: 0
  });
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stepLabels = {
    diagnosis: "Diagnóstico (40 puntos)",
    differential: "Diagnóstico Diferencial (15 puntos)",
    tests: "Pruebas Diagnósticas (15 puntos)",
    treatment: "Plan de Tratamiento (15 puntos)",
    followup: "Plan de Seguimiento (10 puntos)"
  };

  const stepDescriptions = {
    diagnosis: "¿Cuál es tu diagnóstico principal para este paciente?",
    differential: "¿Qué diagnósticos diferenciales considerarías?",
    tests: "¿Qué pruebas diagnósticas ordenarías?",
    treatment: "¿Cuál sería tu plan de tratamiento?",
    followup: "¿Cómo harías seguimiento a este paciente?"
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      }).catch(() => {});
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");

    // Limpiar cookies
    document.cookie = "authToken=; path=/; max-age=0";
    document.cookie = "userId=; path=/; max-age=0";

    router.push("/login");
  };

  useEffect(() => {
    // Obtener caso clínico
    const caseData = getClinicalCaseById(resolvedParams.caseId);
    if (caseData) {
      setClinicalCase(caseData);
    }

    // Obtener usuario ID y email
    let id = localStorage.getItem("userId");
    let email = localStorage.getItem("userEmail") || "";
    
    if (!id) {
      router.push("/login");
      return;
    }
    
    setUserId(id);
    setUserEmail(email);

    // Iniciar caso con presentación clínica
    if (caseData) {
      const initialMessage = `**${caseData.patient.name}**, ${caseData.patient.age} años.\n\n**Queja principal:** ${caseData.presentingComplaint}\n\n**Signos vitales:**\n- Temperatura: ${caseData.vitalSigns.temperature}°C\n- Presión arterial: ${caseData.vitalSigns.bloodPressure}\n- Frecuencia cardíaca: ${caseData.vitalSigns.heartRate} lpm\n- Frecuencia respiratoria: ${caseData.vitalSigns.respiratoryRate} rpm\n- Saturación O2: ${caseData.vitalSigns.oxygenSaturation}%`;
      
      setMessages([{ role: "paciente", content: initialMessage }]);
    }
  }, [resolvedParams.caseId]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }, 0);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || caseCompleted || !clinicalCase) return;

    setError(null);
    const userMessage: Message = { 
      role: "doctor", 
      content: inputValue,
      stepType: currentStep
    };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // Evaluar este paso específico con IA
      const evaluationResponse = await fetch("/api/evaluate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: clinicalCase.id,
          stepType: currentStep,
          stepContent: inputValue,
          caseContext: clinicalCase
        })
      });

      const evaluationData = await evaluationResponse.json();

      if (!evaluationResponse.ok) {
        setError(evaluationData.error || "Error al evaluar");
        return;
      }

      const evaluation = evaluationData.evaluation;
      const score = evaluation.score;

      // Actualizar puntuación del paso
      setStepScores((prev) => ({
        ...prev,
        [currentStep]: score
      }));

      // Crear mensaje de retroalimentación
      const feedbackMessage: Message = {
        role: "paciente",
        content: `**Evaluación - ${stepLabels[currentStep as keyof typeof stepLabels]}**\n\n${evaluation.feedback}\n\n**Explicación:** ${evaluation.explanation}`,
        evaluation: {
          score,
          isCorrect: evaluation.isCorrect,
          stepType: currentStep
        },
        stepType: currentStep
      };

      setMessages((prev) => [...prev, feedbackMessage]);

      // Calcular puntuación total
      const newTotalScore = Object.values({
        ...stepScores,
        [currentStep]: score
      }).reduce((a, b) => a + b, 0);
      
      setTotalScore(newTotalScore);

      // Pasar al siguiente paso
      const steps: EvaluationStep[] = ["diagnosis", "differential", "tests", "treatment", "followup"];
      const currentIndex = steps.indexOf(currentStep);
      
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      } else {
        // Caso completado
        setCaseCompleted(true);

        // Guardar sesión
        await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            caseId: clinicalCase.id,
            caseName: clinicalCase.name,
            points: newTotalScore,
            feedback: `Diagnóstico: ${stepScores.diagnosis}pts, DD: ${stepScores.differential}pts, Pruebas: ${stepScores.tests}pts, Tratamiento: ${stepScores.treatment}pts, Seguimiento: ${stepScores.followup}pts`
          })
        });

        // Cargar casos similares
        try {
          const similarResponse = await fetch(`/api/cases/${clinicalCase.id}/similar`);
          const similarData = await similarResponse.json();
          setSimilarCases(similarData.similarCases || []);
        } catch (error) {
          console.error("Error loading similar cases:", error);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(`Error: ${errorMessage}`);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!clinicalCase) {
    return (
      <main className="flex h-screen items-center justify-center bg-slate-50">
        <Card className="p-8">
          <p className="text-slate-900">Cargando caso clínico...</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar userEmail={userEmail} onLogout={handleLogout} />
      
      <div className="flex h-screen flex-col items-center justify-center p-4 flex-1">
        <Card className="w-full max-w-3xl h-[85vh] flex flex-col shadow-xl border-slate-200">
          
          {/* Cabecera */}
          <div className="p-4 border-b bg-white rounded-t-xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-bold text-lg">{clinicalCase.name}</h2>
                <p className="text-sm text-slate-500">Medicina de Familia</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Puntuación Total</p>
                  <p className="text-2xl font-bold text-blue-600">{totalScore}/100</p>
                </div>
                {caseCompleted && (
                  <Badge className="bg-green-600">✓ Completado</Badge>
                )}
              </div>
            </div>

            {/* Progreso de pasos */}
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(stepLabels).map(([step, label]) => {
                const isCompleted = stepScores[step as keyof typeof stepScores] > 0;
                const isCurrent = step === currentStep;
                
                return (
                  <div
                    key={step}
                    className={`p-2 rounded text-center text-xs font-semibold border ${
                      isCompleted
                        ? "bg-green-100 border-green-500 text-green-900"
                        : isCurrent
                        ? "bg-blue-100 border-blue-500 text-blue-900"
                        : "bg-slate-100 border-slate-300 text-slate-600"
                    }`}
                  >
                    <div>{label.split(" ")[0]}</div>
                    {isCompleted && (
                      <div className="font-bold text-green-700">
                        {stepScores[step as keyof typeof stepScores]}pts
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Información del paciente */}
          <div className="bg-slate-50 p-3 rounded text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>Paciente:</strong> {clinicalCase.patient.name}, {clinicalCase.patient.age}a</div>
              <div><strong>Género:</strong> {clinicalCase.patient.gender === "M" ? "Masculino" : "Femenino"}</div>
              <div><strong>Ocupación:</strong> {clinicalCase.patient.occupation}</div>
              <div><strong>Alergias:</strong> {clinicalCase.patient.allergies.length > 0 ? clinicalCase.patient.allergies.join(", ") : "No conocidas"}</div>
            </div>
          </div>

          {/* Área de Chat */}
        <ScrollArea className="flex-1 p-4 bg-slate-50/50" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index}>
                <div
                  className={`p-3 rounded-lg shadow-sm max-w-[85%] border ${
                    msg.role === "paciente" 
                      ? "bg-white border-slate-200 mr-auto" 
                      : "bg-blue-600 text-white border-blue-700 ml-auto"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.evaluation && (
                  <div className={`mt-2 ml-0 max-w-[85%] p-3 rounded-lg text-xs border ${
                    msg.evaluation.isCorrect
                      ? "bg-green-50 border-green-300"
                      : "bg-amber-50 border-amber-300"
                  }`}>
                    <p className={`font-bold mb-2 ${
                      msg.evaluation.isCorrect ? "text-green-900" : "text-amber-900"
                    }`}>
                      {msg.evaluation.isCorrect ? "✓ Correcto" : "⚠ Necesita mejora"}: +{msg.evaluation.score} puntos
                    </p>
                    <EducationalContent
                      feedback={msg.evaluation.feedback || ""}
                      explanation={msg.evaluation.explanation || ""}
                      clinicalReferences={msg.evaluation.clinicalReferences}
                      learnMore={msg.evaluation.learnMore}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="p-3 rounded-lg bg-white border border-slate-200 max-w-[85%] mr-auto">
                <p className="text-sm text-slate-500">Evaluando tu respuesta...</p>
              </div>
            )}

            {caseCompleted && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
                  <p className="font-bold text-green-900 mb-2">¡Caso Completado!</p>
                  <p className="text-sm text-green-800 mb-3">
                    Puntuación total: {totalScore} puntos
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-green-600 hover:bg-green-700 w-full">
                      Volver al Dashboard
                    </Button>
                  </Link>
                </div>
                
                {similarCases.length > 0 && (
                  <SimilarCasesSuggestion similarCases={similarCases} />
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        {!caseCompleted && (
          <div className="p-4 border-t bg-white flex flex-col gap-3">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <p className="font-bold text-blue-900 text-sm">{stepLabels[currentStep as keyof typeof stepLabels]}</p>
              <p className="text-blue-800 text-sm">{stepDescriptions[currentStep as keyof typeof stepDescriptions]}</p>
            </div>
            
            <div className="flex gap-2">
              <Input 
                placeholder={`Tu respuesta sobre ${currentStep}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Evaluando..." : "Enviar"}
              </Button>
            </div>
          </div>
        )}
        </Card>
      </div>
    </main>
  );
}
