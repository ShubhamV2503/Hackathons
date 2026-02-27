import { createContext, useContext, useState, ReactNode } from "react";

export type RubricCategory = "Flowchart" | "Pseudocode" | "Algorithm";

export interface Criterion {
  id: number;
  name: string;
  weight: number;
  indicators: string[];
}

export interface Rubric {
  id: number;
  name: string;
  category: RubricCategory;
  criteria: Criterion[];
}

interface RubricContextType {
  rubrics: Rubric[];
  addRubric: (rubric: Omit<Rubric, "id">) => void;
  updateRubric: (id: number, patch: Partial<Omit<Rubric, "id">>) => void;
  removeRubric: (id: number) => void;
}

const defaultRubrics: Rubric[] = [
  {
    id: 1,
    name: "Flowchart Evaluation Rubric",
    category: "Flowchart",
    criteria: [
      { id: 1, name: "Structure", weight: 30, indicators: ["Clean hierarchy", "Proper start/end symbols"] },
      { id: 2, name: "Decision Completeness", weight: 40, indicators: ["All branches covered", "Default paths defined"] },
      { id: 3, name: "Naming", weight: 30, indicators: ["Descriptive labels", "Consistent terminology"] },
    ],
  },
  {
    id: 2,
    name: "Pseudocode Evaluation Rubric",
    category: "Pseudocode",
    criteria: [
      { id: 4, name: "Loop Logic", weight: 35, indicators: ["Correct loop termination", "No infinite loops"] },
      { id: 5, name: "Variable Naming", weight: 25, indicators: ["Descriptive names", "Consistent casing"] },
      { id: 6, name: "Control Flow", weight: 40, indicators: ["Proper IF/ELSE structure", "Edge cases handled"] },
    ],
  },
  {
    id: 3,
    name: "Algorithm Evaluation Rubric",
    category: "Algorithm",
    criteria: [
      { id: 7, name: "Time Complexity", weight: 30, indicators: ["Optimal approach used", "No redundant iterations"] },
      { id: 8, name: "Correctness", weight: 40, indicators: ["Handles edge cases", "Produces correct output"] },
      { id: 9, name: "Readability", weight: 30, indicators: ["Clear step breakdown", "Logical ordering"] },
    ],
  },
];

const RubricContext = createContext<RubricContextType | undefined>(undefined);

export function RubricProvider({ children }: { children: ReactNode }) {
  const [rubrics, setRubrics] = useState<Rubric[]>(defaultRubrics);

  const addRubric = (rubric: Omit<Rubric, "id">) => {
    setRubrics((prev) => [...prev, { ...rubric, id: Date.now() }]);
  };

  const updateRubric = (id: number, patch: Partial<Omit<Rubric, "id">>) => {
    setRubrics((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRubric = (id: number) => {
    setRubrics((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RubricContext.Provider value={{ rubrics, addRubric, updateRubric, removeRubric }}>
      {children}
    </RubricContext.Provider>
  );
}

export function useRubrics() {
  const ctx = useContext(RubricContext);
  if (!ctx) throw new Error("useRubrics must be used within RubricProvider");
  return ctx;
}
