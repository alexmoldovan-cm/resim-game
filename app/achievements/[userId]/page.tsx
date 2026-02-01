"use client";

import { useState, useEffect, use } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ACHIEVEMENTS } from "@/lib/achievements";

interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export default function AchievementsPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalSessions: 0,
    casesCompleted: 0
  });

  useEffect(() => {
    fetchAchievements();
  }, [resolvedParams.userId]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/achievements/${resolvedParams.userId}`);
      const data = await response.json();
      
      if (data.unlockedAchievements) {
        setUnlockedAchievements(data.unlockedAchievements);
      }
      
      if (data.playerStats) {
        setStats({
          totalPoints: data.playerStats.totalPoints,
          totalSessions: data.playerStats.totalSessions,
          casesCompleted: Object.keys(data.playerStats.casesCompleted).length
        });
      }
    } catch (error) {
      console.error("Error cargando logros:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8">
          <p className="text-white">Cargando logros...</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Logros 🏅</h1>
            <p className="text-slate-400">Tu colección de insignias de maestría médica</p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              ← Volver al Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Puntos Totales</p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalPoints}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Sesiones Completadas</p>
            <p className="text-3xl font-bold text-white">{stats.totalSessions}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Casos Practicados</p>
            <p className="text-3xl font-bold text-green-400">{stats.casesCompleted}</p>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Logros Desbloqueados ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </h2>
          
          {unlockedAchievements.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-400">Aún no has desbloqueado logros. ¡Completa casos para ganarlos!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map((achievement) => (
                <Card 
                  key={achievement.id}
                  className="bg-gradient-to-br from-amber-900 to-amber-950 border-amber-600 p-6"
                >
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{achievement.name}</h3>
                  <p className="text-sm text-amber-100">{achievement.description}</p>
                  <div className="mt-3">
                    <Badge className="bg-amber-600">Desbloqueado ✓</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Locked Achievements */}
        {unlockedAchievements.length < ACHIEVEMENTS.length && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Próximos Logros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.filter(a => !unlockedAchievements.find(u => u.id === a.id)).slice(0, 3).map((achievement) => (
                <Card 
                  key={achievement.id}
                  className="bg-slate-800 border-slate-600 p-6 opacity-60"
                >
                  <div className="text-5xl mb-3 grayscale">{achievement.icon}</div>
                  <h3 className="text-lg font-bold text-slate-300 mb-1">{achievement.name}</h3>
                  <p className="text-sm text-slate-400">{achievement.description}</p>
                  <div className="mt-3">
                    <Badge variant="outline" className="border-slate-600 text-slate-400">Bloqueado</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
