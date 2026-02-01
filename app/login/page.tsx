"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setError("Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.");
        } else {
          setError(data.error || "Error al iniciar sesión");
        }
        return;
      }

      // Guardar token en cookie y localStorage
      if (data.token) {
        // Guardar en localStorage para el cliente
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userEmail", data.email);
        
        // Guardar en cookie para el middleware
        document.cookie = `authToken=${data.token}; path=/; max-age=${30 * 24 * 60 * 60}`;
        document.cookie = `userId=${data.userId}; path=/; max-age=${30 * 24 * 60 * 60}`;
      }

      // Pequeña pausa para asegurar que la cookie se guarda
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-900">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ResidentSim</h1>
            <p className="text-slate-400">Simulador de Casos Clínicos</p>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-900/20 border border-red-600/30 rounded-lg">
              <p className="text-red-400 text-sm">⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-slate-400 text-sm">
              ¿Olvidó su contraseña?{" "}
              <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 font-semibold">
                Resetear contraseña
              </Link>
            </p>
            <p className="text-slate-400 text-sm">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </main>
  );
}
