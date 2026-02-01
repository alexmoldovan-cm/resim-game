"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay sesión activa
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (authToken && userId) {
      // Si hay sesión, ir al dashboard
      router.push("/dashboard");
    } else {
      // Si no hay sesión, ir al login
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <p className="text-white">Redirigiendo...</p>
    </div>
  );
}