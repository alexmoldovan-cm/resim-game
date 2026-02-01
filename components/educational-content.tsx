"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EducationalContentProps {
  feedback: string;
  explanation: string;
  clinicalReferences?: string[];
  learnMore?: string;
}

export function EducationalContent({
  feedback,
  explanation,
  clinicalReferences,
  learnMore,
}: EducationalContentProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-amber-800 text-sm"><strong>Evaluación:</strong> {feedback}</p>
      
      {explanation && (
        <p className="text-amber-700 text-xs italic">{explanation}</p>
      )}

      {(clinicalReferences && clinicalReferences.length > 0) || learnMore ? (
        <>
          <Button
            onClick={() => setExpanded(!expanded)}
            className="text-xs h-6 bg-amber-700 hover:bg-amber-800 text-white mt-2"
          >
            {expanded ? "▼ Ocultar" : "► Aprende Más"}
          </Button>

          {expanded && (
            <div className="mt-2 p-2 bg-amber-900/30 border border-amber-600 rounded text-xs text-amber-800">
              {learnMore && (
                <p className="mb-2"><strong>📚 Concepto Clave:</strong> {learnMore}</p>
              )}
              {clinicalReferences && clinicalReferences.length > 0 && (
                <div>
                  <p><strong>📖 Referencias Clínicas:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    {clinicalReferences.map((ref, idx) => (
                      <li key={idx}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
