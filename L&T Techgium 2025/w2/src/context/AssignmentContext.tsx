import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Assignment {
    id: number;
    name: string;
    description?: string;
    rubricId?: number; // Optional link to a rubric
    createdAt: string;
}

interface AssignmentContextType {
    assignments: Assignment[];
    addAssignment: (assignment: Omit<Assignment, "id" | "createdAt">) => void;
    deleteAssignment: (id: number) => void;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export function AssignmentProvider({ children }: { children: ReactNode }) {
    const [assignments, setAssignments] = useState<Assignment[]>(() => {
        try {
            const stored = localStorage.getItem("assignments_v2");
            if (stored) return JSON.parse(stored);
        } catch {
            // ignore
        }
        return [
            { id: 1, name: "Sorting Algorithm Flowchart", description: "Create a flowchart for bubble sort", createdAt: new Date().toISOString() },
            { id: 2, name: "Binary Search Tree Pseudocode", description: "Write pseudocode for BST insertion", createdAt: new Date().toISOString() },
            { id: 3, name: "Linked List Operations", description: "Implement linked list deletion", createdAt: new Date().toISOString() },
        ];
    });

    useEffect(() => {
        try {
            localStorage.setItem("assignments_v2", JSON.stringify(assignments));
        } catch {
            // ignore
        }
    }, [assignments]);

    const addAssignment = (assignment: Omit<Assignment, "id" | "createdAt">) => {
        const newAssignment: Assignment = {
            ...assignment,
            id: Date.now(),
            createdAt: new Date().toISOString(),
        };
        setAssignments((prev) => [...prev, newAssignment]);
    };

    const deleteAssignment = (id: number) => {
        setAssignments((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <AssignmentContext.Provider value={{ assignments, addAssignment, deleteAssignment }}>
            {children}
        </AssignmentContext.Provider>
    );
}

export function useAssignments() {
    const ctx = useContext(AssignmentContext);
    if (!ctx) throw new Error("useAssignments must be used within AssignmentProvider");
    return ctx;
}
