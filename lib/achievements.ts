// Sistema de logros/achievements para la aplicación

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: PlayerStats) => boolean;
}

export interface PlayerStats {
  totalPoints: number;
  totalSessions: number;
  casesCompleted: Record<string, number>; // caseId -> maxScore
  perfectScores: number; // Cantidad de casos con 100 puntos
  allCasesCompleted: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    name: "Primeros Pasos",
    description: "Completa tu primer caso clínico",
    icon: "🏥",
    condition: (stats) => stats.totalSessions >= 1
  },
  {
    id: "practitioner",
    name: "Practicante",
    description: "Completa 5 casos clínicos",
    icon: "👨‍⚕️",
    condition: (stats) => stats.totalSessions >= 5
  },
  {
    id: "specialist",
    name: "Especialista",
    description: "Completa 10 casos clínicos",
    icon: "👨‍⚕️👩‍⚕️",
    condition: (stats) => stats.totalSessions >= 10
  },
  {
    id: "perfect-diagnosis",
    name: "Diagnóstico Perfecto",
    description: "Consigue 100 puntos en un caso",
    icon: "💯",
    condition: (stats) => stats.perfectScores >= 1
  },
  {
    id: "master-diagnostician",
    name: "Maestro Diagnosticador",
    description: "Consigue 100 puntos en 3 casos diferentes",
    icon: "🏅",
    condition: (stats) => stats.perfectScores >= 3
  },
  {
    id: "chest-expert",
    name: "Experto en Cardiología",
    description: "Consigue 80+ puntos en Dolor Torácico",
    icon: "❤️",
    condition: (stats) => (stats.casesCompleted["chest-pain-001"] || 0) >= 80
  },
  {
    id: "sepsis-expert",
    name: "Experto en Infecciones",
    description: "Consigue 80+ puntos en Sepsis",
    icon: "🔬",
    condition: (stats) => (stats.casesCompleted["sepsis-001"] || 0) >= 80
  },
  {
    id: "stroke-expert",
    name: "Experto en Neurología",
    description: "Consigue 80+ puntos en Accidente Cerebrovascular",
    icon: "🧠",
    condition: (stats) => (stats.casesCompleted["stroke-001"] || 0) >= 80
  },
  {
    id: "respiratory-expert",
    name: "Experto en Neumología",
    description: "Consigue 80+ puntos en Neumonía",
    icon: "💨",
    condition: (stats) => (stats.casesCompleted["pneumonia-001"] || 0) >= 80
  },
  {
    id: "endo-expert",
    name: "Experto en Endocrinología",
    description: "Consigue 80+ puntos en Cetoacidosis Diabética",
    icon: "🩺",
    condition: (stats) => (stats.casesCompleted["diabetic-ketoacidosis-001"] || 0) >= 80
  },
  {
    id: "all-cases",
    name: "Médico Integral",
    description: "Completa todos los casos clínicos disponibles",
    icon: "🎓",
    condition: (stats) => stats.allCasesCompleted
  },
  {
    id: "high-scorer",
    name: "Puntuación Alta",
    description: "Acumula 500 puntos totales",
    icon: "⭐",
    condition: (stats) => stats.totalPoints >= 500
  },
  {
    id: "elite-doctor",
    name: "Médico de Élite",
    description: "Acumula 1000 puntos totales",
    icon: "👑",
    condition: (stats) => stats.totalPoints >= 1000
  }
];

export function getUnlockedAchievements(stats: PlayerStats): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.condition(stats));
}

export function getNextAchievements(stats: PlayerStats): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => !achievement.condition(stats));
}
