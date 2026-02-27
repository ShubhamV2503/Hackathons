import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, BookCheck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAssignments } from "@/context/AssignmentContext";
import { useRubrics } from "@/context/RubricContext";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Assignments() {
    const { assignments, addAssignment, deleteAssignment } = useAssignments();
    const { rubrics } = useRubrics();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedRubricId, setSelectedRubricId] = useState<string>("");
    const { toast } = useToast();
    const { user } = useAuth();

    const isInstructor = user?.role === "instructor";

    const handleCreate = () => {
        if (!name.trim()) return;

        const rubricId = selectedRubricId ? parseInt(selectedRubricId) : undefined;

        addAssignment({
            name,
            description,
            rubricId
        });

        setName("");
        setDescription("");
        setSelectedRubricId("");
        toast({ title: "Assignment created", description: `"${name}" has been added.` });
    };

    const getRubricName = (id?: number) => {
        if (!id) return null;
        return rubrics.find(r => r.id === id)?.name;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
                <p className="text-muted-foreground mt-1">Manage assignments for student submissions.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Create Assignment Form - Only for Instructors */}
                {isInstructor && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 glass-card p-6 h-fit">
                        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" /> Create New
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sorting Algorithm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description or instructions..."
                                    className="resize-none h-32"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Rubric</label>
                                <Select value={selectedRubricId} onValueChange={setSelectedRubricId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a rubric" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rubrics.map((rubric) => (
                                            <SelectItem key={rubric.id} value={rubric.id.toString()}>
                                                {rubric.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleCreate} disabled={!name.trim()} className="w-full gradient-primary text-primary-foreground">
                                Create Assignment
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Existing Assignments List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${isInstructor ? "lg:col-span-2" : "lg:col-span-3"} glass-card p-0 overflow-hidden`}
                >
                    <div className="px-6 py-4 border-b border-border">
                        <h2 className="font-semibold text-foreground flex items-center gap-2">
                            <BookCheck className="w-5 h-5 text-primary" /> Existing Assignments
                        </h2>
                    </div>
                    <div className="divide-y divide-border">
                        {assignments.length === 0 ? (
                            <p className="text-center text-muted-foreground py-12">No assignments available.</p>
                        ) : (
                            assignments.map((assignment) => {
                                const rubricName = getRubricName(assignment.rubricId);
                                return (
                                    <div key={assignment.id} className="p-6 flex items-start justify-between group hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <h3 className="font-medium text-foreground">{assignment.name}</h3>
                                            {assignment.description && <p className="text-sm text-muted-foreground">{assignment.description}</p>}
                                            {rubricName && (
                                                <div className="flex items-center gap-1.5 text-xs text-primary mt-1">
                                                    <ClipboardList className="w-3.5 h-3.5" />
                                                    <span>Rubric: {rubricName}</span>
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground pt-2">Created: {format(new Date(assignment.createdAt), "PPP")}</p>
                                        </div>
                                        {isInstructor && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    deleteAssignment(assignment.id);
                                                    toast({ title: "Assignment deleted", description: "The assignment has been removed." });
                                                }}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
