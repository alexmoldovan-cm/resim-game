"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";

interface UserStats {
  email: string;
  totalSessions: number;
  totalPoints: number;
  casesCompleted: number;
  casesStarted: number;
  bestScore: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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
    const email = localStorage.getItem("userEmail");
    const id = localStorage.getItem("userId");

    if (!id || !email) {
      router.push("/login");
      return;
    }

    setUserEmail(email);
    setUserId(id);

    // Cargar estadísticas
    fetchUserStats(id);
  }, [router]);

  const fetchUserStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/sessions/${userId}`);
      const data = await response.json();

      if (data) {
        const bestScores = data.bestScores || {};
        const scores = Object.values(bestScores) as any[];
        
        setStats({
          email: userEmail || "",
          totalSessions: data.totalSessions || 0,
          totalPoints: data.totalPoints || 0,
          casesCompleted: scores.filter(s => s.completed).length,
          casesStarted: Object.keys(bestScores).length,
          bestScore: Math.max(...scores.map((s: any) => s.points), 0)
        });
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("La nueva contraseña no puede ser igual a la actual");
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || "Error al cambiar la contraseña");
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);

      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setPasswordError(`Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Navbar userEmail={userEmail} onLogout={handleLogout} />
        <div className="flex items-center justify-center h-screen">
          <Card className="bg-slate-800 border-slate-700 p-8">
            <p className="text-white">Cargando perfil...</p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navbar userEmail={userEmail} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto p-6">
        {/* Información de usuario */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
              <p className="text-slate-400">{userEmail}</p>
              <p className="text-xs text-slate-500 mt-2">ID: {userId.slice(0, 12)}</p>
            </div>
            <Badge className="bg-blue-600">Activo</Badge>
          </div>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Sesiones Totales</p>
            <p className="text-3xl font-bold text-white">{stats?.totalSessions || 0}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Puntos Acumulados</p>
            <p className="text-3xl font-bold text-blue-400">{stats?.totalPoints || 0}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Casos Completados</p>
            <p className="text-3xl font-bold text-green-400">{stats?.casesCompleted || 0}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Mejor Puntuación</p>
            <p className="text-3xl font-bold text-purple-400">{stats?.bestScore || 0}</p>
          </Card>
        </div>

        {/* Cambiar Contraseña */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Seguridad</h2>
            {!changingPassword && (
              <Button
                onClick={() => setChangingPassword(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cambiar Contraseña
              </Button>
            )}
          </div>

          {changingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                  <p className="text-red-400 text-sm">⚠️ {passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                  <p className="text-green-400 text-sm">✓ Contraseña actualizada exitosamente</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña Actual
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nueva Contraseña
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar Cambios
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError(null);
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-slate-400">Haz clic en "Cambiar Contraseña" para actualizar tu contraseña</p>
          )}
        </Card>
      </div>
    </main>
  );
}
