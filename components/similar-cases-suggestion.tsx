"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface SimilarCase {
  id: string;
  name: string;
  specialization: string;
  presentingComplaint: string;
}

interface SimilarCasesSuggestionProps {
  similarCases: SimilarCase[];
}

export function SimilarCasesSuggestion({ similarCases }: SimilarCasesSuggestionProps) {
  if (similarCases.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-600 p-6 mt-6">
      <h3 className="text-white font-bold mb-4 flex items-center">
        <span className="text-2xl mr-2">🎯</span> Casos Similares Sugeridos
      </h3>
      <p className="text-slate-300 text-sm mb-4">
        Completa estos casos para mejorar tus habilidades en esta área
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {similarCases.map((caseItem) => (
          <Link key={caseItem.id} href={`/case/${caseItem.id}`}>
            <div className="p-3 bg-slate-700/50 rounded border border-purple-500 hover:border-purple-400 hover:bg-slate-600/50 transition cursor-pointer">
              <p className="text-white font-semibold text-sm">{caseItem.name}</p>
              <p className="text-slate-400 text-xs mt-1">{caseItem.presentingComplaint}</p>
              <Button
                className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                Practicar Caso →
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
