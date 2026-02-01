"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PerformanceStats } from "@/components/performance-stats";
import Link from "next/link";
import { AVAILABLE_CASES } from "@/lib/clinical-cases-index";

interface CaseInfo {
  id: string;
  name: string;
  description?: string;
  patient?: string;
  bestScore?: number;
  completed?: boolean;
}

interface PerformanceData {
  diagnosis: number;
  differential: number;
  tests: number;
  treatment: number;
  followup: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseInfo[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [bestScores, setBestScores] = useState<Record<string, { points: number; completed: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    diagnosis: 0,
    differential: 0,
    tests: 0,
    treatment: 0,
    followup: 0,
  });
  const [totalCasesCompleted, setTotalCasesCompleted] = useState(0);

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    
    // Llamar al endpoint de logout
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      }).catch(() => {});
    }

    // Limpiar localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");

    // Limpiar cookies
    document.cookie = "authToken=; path=/; max-age=0";
    document.cookie = "userId=; path=/; max-age=0";

    // Redirigir a login
    router.push("/login");
  };

  useEffect(() => {
    // Establecer casos disponibles
    setCases(AVAILABLE_CASES.map((c: any) => ({
      ...c,
      completed: false
    })));
    
    // Obtener userId y email del localStorage (desde login)
    let id = localStorage.getItem("userId");
    let email = localStorage.getItem("userEmail") || "";
    
    if (!id) {
      // Si no hay sesión, redirigir a login
      router.push("/login");
      return;
    }
    
    setUserId(id);
    setUserEmail(email);
    
    // Cargar historial del usuario
    if (id) {
      fetchUserHistory(id);
    }
  }, [router]);

  const fetchUserHistory = async (userId: string) => {
    try {
      // Cargar historial de sesiones
      const sessionsResponse = await fetch(`/api/sessions/${userId}`);
      const sessionsData = await sessionsResponse.json();

      // Cargar estadísticas detalladas
      const statsResponse = await fetch(`/api/stats/${userId}`);
      const statsData = await statsResponse.json();

      if (sessionsData.bestScores) {
        setBestScores(sessionsData.bestScores);
        
        setCases((AVAILABLE_CASES as any[]).map(c => ({
          ...c,
          bestScore: sessionsData.bestScores[c.id]?.points,
          completed: sessionsData.bestScores[c.id]?.completed || false
        })));
      }

      if (statsData.performanceByStep) {
        setPerformanceData(statsData.performanceByStep);
        setTotalCasesCompleted(statsData.completedCases || 0);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const isLocked = (caseInfo: CaseInfo) => {
    // Un caso está bloqueado si ya fue completado con 60+ puntos
    const score = bestScores[caseInfo.id];
    return score && score.points >= 60 && score.completed;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8">
          <p className="text-white">Cargando...</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-white">ResidentSim</h1>
            <p className="text-xs text-slate-400">{userEmail}</p>
          </div>
          <Button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-400">Entrena tus habilidades clínicas con casos reales simulados</p>
        </div>

        {/* Performance Statistics */}
        {totalCasesCompleted > 0 && (
          <div className="mb-8">
            <PerformanceStats data={performanceData} totalCasesCompleted={totalCasesCompleted} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Casos Completados</p>
            <p className="text-3xl font-bold text-white">{Object.values(bestScores).filter(s => s.completed).length}/{AVAILABLE_CASES.length}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Puntos Totales</p>
            <p className="text-3xl font-bold text-blue-400">{Object.values(bestScores).reduce((sum, s) => sum + s.points, 0)}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Mejor Puntuación</p>
            <p className="text-3xl font-bold text-green-400">{Math.max(...Object.values(bestScores).map(s => s.points), 0) || 0}</p>
          </Card>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {cases.map((c) => {
            const locked = isLocked(c);
            return (
              <Card key={c.id} className={`border-2 transition-all ${
                locked 
                  ? "bg-slate-700 border-slate-600 opacity-60" 
                  : "bg-slate-800 border-slate-600 hover:border-blue-500"
              } p-6`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{c.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{c.patient}</p>
                  </div>
                  {c.bestScore !== undefined && (
                    <Badge variant="outline" className={c.completed ? "bg-green-900 text-green-200 border-green-600" : "bg-amber-900 text-amber-200 border-amber-600"}>
                      {c.bestScore}/100
                    </Badge>
                  )}
                </div>

                <p className="text-slate-300 text-sm mb-4">{c.description}</p>

                {locked && (
                  <div className="mb-4 p-2 bg-blue-900/30 border border-blue-600 rounded text-blue-200 text-xs">
                    ✓ Caso completado con {c.bestScore}+ puntos
                  </div>
                )}

                <Link href={locked ? "#" : `/case/${c.id}`} className="block">
                  <Button 
                    className={`w-full ${
                      locked
                        ? "bg-slate-600 hover:bg-slate-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={locked}
                  >
                    {locked ? "Caso Completado" : "Iniciar Caso"}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Footer with achievements link */}
        <div className="text-center">
          <Link href={`/achievements/${userId}`}>
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-950">
              Ver Logros 🏅
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
