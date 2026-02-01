"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PerformanceData {
  diagnosis: number;
  differential: number;
  tests: number;
  treatment: number;
  followup: number;
}

interface PerformanceStatsProps {
  data: PerformanceData;
  totalCasesCompleted: number;
}

export function PerformanceStats({ data, totalCasesCompleted }: PerformanceStatsProps) {
  const average = Math.round(
    (data.diagnosis + data.differential + data.tests + data.treatment + data.followup) / 5
  );

  const criteria = [
    { name: "Diagnóstico", value: data.diagnosis, max: 40, color: "bg-blue-500" },
    { name: "DD", value: data.differential, max: 15, color: "bg-purple-500" },
    { name: "Pruebas", value: data.tests, max: 15, color: "bg-cyan-500" },
    { name: "Tratamiento", value: data.treatment, max: 15, color: "bg-green-500" },
    { name: "Seguimiento", value: data.followup, max: 10, color: "bg-orange-500" },
  ];

  const getLevel = (percentage: number) => {
    if (percentage >= 90) return { text: "Excelente", color: "bg-green-100 text-green-900" };
    if (percentage >= 75) return { text: "Bueno", color: "bg-blue-100 text-blue-900" };
    if (percentage >= 60) return { text: "Aceptable", color: "bg-yellow-100 text-yellow-900" };
    return { text: "Necesita Mejora", color: "bg-red-100 text-red-900" };
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-white font-bold mb-4">Desempeño General</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Promedio</p>
            <p className="text-3xl font-bold text-white">{average}%</p>
            <Badge className={`mt-2 ${getLevel(average).color}`}>
              {getLevel(average).text}
            </Badge>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Casos Completados</p>
            <p className="text-3xl font-bold text-green-400">{totalCasesCompleted}</p>
          </div>
        </div>
      </Card>

      {/* Detailed Criteria */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-white font-bold mb-4">Desempeño por Criterio</h3>
        <div className="space-y-4">
          {criteria.map((criterion) => {
            const percentage = Math.round((criterion.value / criterion.max) * 100);
            return (
              <div key={criterion.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-white text-sm font-medium">{criterion.name}</span>
                  <span className="text-slate-300 text-sm">{criterion.value}/{criterion.max} pts</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`${criterion.color} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className="text-slate-400 text-xs mt-1">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <h4 className="text-green-400 font-bold mb-3">Fortalezas</h4>
          <ul className="space-y-2">
            {criteria
              .filter((c) => (c.value / c.max) >= 0.75)
              .map((c) => (
                <li key={c.name} className="text-slate-300 text-sm">
                  ✓ {c.name} ({Math.round((c.value / c.max) * 100)}%)
                </li>
              ))}
            {criteria.filter((c) => (c.value / c.max) >= 0.75).length === 0 && (
              <li className="text-slate-500 text-sm italic">Aún sin estadísticas</li>
            )}
          </ul>
        </Card>

        <Card className="bg-slate-800 border-slate-700 p-4">
          <h4 className="text-orange-400 font-bold mb-3">Áreas de Mejora</h4>
          <ul className="space-y-2">
            {criteria
              .filter((c) => (c.value / c.max) < 0.75)
              .map((c) => (
                <li key={c.name} className="text-slate-300 text-sm">
                  → {c.name} ({Math.round((c.value / c.max) * 100)}%)
                </li>
              ))}
            {criteria.filter((c) => (c.value / c.max) < 0.75).length === 0 && (
              <li className="text-slate-500 text-sm italic">¡Excelente desempeño!</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
