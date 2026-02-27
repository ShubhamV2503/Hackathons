import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, AlertTriangle, Sparkles, Eye, Download } from "lucide-react";
import { mockStats, mockEvaluations } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generatePdfReport } from "@/lib/reportUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Calculate stats dynamically
export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isInstructor = user?.role === "instructor";

  const stagger = {
    container: { transition: { staggerChildren: 0.08 } },
    item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } },
  };

  const [assignments, setAssignments] = useState(() => {
    try {
      const stored = localStorage.getItem("assignments");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [
      { id: 1, name: "Sorting Algorithm Flowchart" },
      { id: 2, name: "Binary Search Tree Pseudocode" },
      { id: 3, name: "Linked List Operations" },
    ];
  });
  const [newAssignment, setNewAssignment] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddAssignment = () => {
    if (newAssignment.trim()) {
      const updated = [...assignments, { id: Date.now(), name: newAssignment.trim() }];
      setAssignments(updated);
      try {
        localStorage.setItem("assignments", JSON.stringify(updated));
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event("storage"));
      setNewAssignment("");
    }
  };


  const handleRemoveAssignment = (id: number) => {
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    try {
      localStorage.setItem("assignments", JSON.stringify(updated));
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("storage"));
  };

  // Simulate evaluation data structure
  const [evaluations, setEvaluations] = useState(() => {
    try {
      const stored = localStorage.getItem("rubric_ai_evaluations");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    // Fallback to empty array if nothing stored
    return [];
  });

  // Listen for storage updates to refresh dashboard
  React.useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem("rubric_ai_evaluations");
        if (stored) setEvaluations(JSON.parse(stored));
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener("rubric_ai_evaluations_updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("rubric_ai_evaluations_updated", handleStorageChange);
    };
  }, []);

  // Calculate stats dynamically
  const stats = [
    { label: "Total Submissions", value: evaluations.length, icon: FileText, color: "text-primary" },
    { label: "Average Score", value: `${evaluations.length > 0 ? Math.round(evaluations.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / evaluations.length) : 0}%`, icon: TrendingUp, color: "text-success" },
  ];

  // Filter stats for students
  const displayedStats = stats; // Show all stats for everyone

  const handleStudentClick = (index: number) => {
    const evaluation = evaluations[index];
    if (evaluation && evaluation.fileData) {
      setSelectedImage(evaluation.fileData);
    } else if (index === 0) {
      // Fallback for static demo if no real data
      setSelectedImage("/submission/rohit.jpg");
    }
  };

  const handleDownloadReport = async (e: any) => {
    try {
      const blob = await generatePdfReport(e);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filenameSafe = (e.filename || "submission").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `report_${filenameSafe}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      toast({ title: "Error", description: "Failed to generate PDF report", variant: "destructive" });
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's your evaluation overview.</p>
      </div>

      {/* Assignment Creation Section - Only for Instructors */}
      {isInstructor && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            {/* Placeholder for quick actions if needed */}
            <Button onClick={() => window.location.href = '/assignments'}>Manage Assignments</Button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4`} // Always use grid for multiple stats
        variants={stagger.container}
        initial="initial"
        animate="animate"
      >
        {displayedStats.map((s) => (
          <motion.div key={s.label} variants={stagger.item} className="stat-card group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color} group-hover:scale-110 transition-transform`} />
            </div>
            <span className="text-2xl font-bold text-foreground">{s.value}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Evaluations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Evaluations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-6 py-3 font-medium">Student (Filename)</th>
                <th className="text-left px-6 py-3 font-medium">Assignment</th>
                <th className="text-left px-6 py-3 font-medium">Submission Type</th>
                <th className="text-left px-6 py-3 font-medium">Score</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Feedback</th>
                <th className="text-center px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((e, index) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td
                    className={`px-6 py-3 font-medium text-foreground ${isInstructor ? "cursor-pointer hover:underline text-primary" : ""}`}
                    onClick={() => isInstructor && handleStudentClick(index)}
                  >
                    {e.filename}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{e.assignment}</td>
                  <td className="px-6 py-3 text-muted-foreground">{e.submissionType}</td>
                  <td className="px-6 py-3 font-semibold text-foreground">{e.score}%</td>

                  <td className="px-6 py-3 flex gap-2 items-center">
                    <Badge variant="outline" className="text-primary border-primary/30">
                      Submitted
                    </Badge>
                    <Badge
                      variant={e.status === "Pass" ? "default" : "destructive"}
                      className={e.status === "Pass"
                        ? "bg-success text-success-foreground"
                        : "bg-destructive text-destructive-foreground"}
                    >
                      {e.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-3 text-muted-foreground">{e.feedback}</td>
                  <td className="px-6 py-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(e)} className="text-muted-foreground hover:text-primary">
                      <Download className="w-4 h-4 mr-1" />
                      Report
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button className="m-6 gradient-primary text-primary-foreground hover:opacity-90 transition-opacity" onClick={() => {
          // Simple PDF generation
          const rows = evaluations.map(e => {
            return `${e.filename}\t${e.assignment}\t${e.submissionType}\tSubmitted, ${e.status}\t${e.score}%\t${e.feedback}`;
          }).join("\n");

          const header = "Student\tAssignment\tSubmission Type\tStatus\tScore\tFeedback";

          const blob = new Blob([
            `${header}\n${rows}`
          ], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "evaluation_report.pdf";
          a.click();
          URL.revokeObjectURL(url);
        }}>
          View Full Report
        </Button>
      </motion.div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Submission</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Student Submission"
                className="max-h-[80vh] w-auto object-contain rounded-md"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
