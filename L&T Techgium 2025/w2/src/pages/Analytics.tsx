import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePdfReport } from "@/lib/reportUtils";

export default function Analytics() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("last-30");
  const [evaluations, setEvaluations] = useState<any[]>([]);

  // Fetch data on mount and listen for updates
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem("rubric_ai_evaluations");
        if (stored) {
          setEvaluations(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load analytics data", e);
      }
    };

    loadData();
    window.addEventListener("rubric_ai_evaluations_updated", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("rubric_ai_evaluations_updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Calculate Pass vs Needs Revision
  // Calculate Pass vs Fail
  const passCount = evaluations.filter(e => e.status === "Pass").length;
  const failCount = evaluations.filter(e => e.status === "Fail" || e.status === "Needs Revision").length; // Include old 'Needs Revision' as Fail
  const passFailData = [
    { name: "Pass", value: passCount, fill: "hsl(142 76% 36%)" }, // Success color
    { name: "Fail", value: failCount, fill: "hsl(0 84% 60%)" }, // Destructive color
  ].filter(d => d.value > 0);

  // Calculate Average Score by Assignment
  const assignmentStats = evaluations.reduce((acc: any, curr: any) => {
    const name = curr.assignment || "Untitled";
    if (!acc[name]) {
      acc[name] = { total: 0, count: 0 };
    }
    acc[name].total += (curr.score || 0);
    acc[name].count += 1;
    return acc;
  }, {});

  const assignmentPerformance = Object.keys(assignmentStats).map(key => ({
    assignment: key,
    averageScore: Math.round(assignmentStats[key].total / assignmentStats[key].count)
  }));

  // Recent Performance (First 5)
  const recentPerformance = evaluations.slice(0, 5);

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Real-time student performance insights.</p>
        </div>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
          <option value="last-7">Last 7 days</option>
          <option value="last-30">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart - Average Score by Assignment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Average Score by Assignment</h3>
          {assignmentPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={assignmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="assignment" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="averageScore" name="Avg Score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </motion.div>

        {/* Pie chart - Pass vs Fail */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Pass Rate</h3>
          {passFailData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {passFailData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ borderRadius: 8, backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Performance Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Recent Student Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Student (Filename)</th>
                <th className="text-left py-3 px-4 font-medium">Assignment</th>
                <th className="text-left py-3 px-4 font-medium">Score</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Feedback</th>
                <th className="text-center py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPerformance.length > 0 ? (
                recentPerformance.map((s, i) => (
                  <tr key={s.id || i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{s.filename || s.student}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.assignment}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{s.score}%</td>
                    <td className="py-3 px-4">
                      <Badge variant={s.status === "Pass" ? "default" : "secondary"} className={s.status === "Pass" ? "bg-success text-success-foreground" : "bg-warning/15 text-warning border-warning/30"}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate" title={s.feedback}>
                      {s.feedback}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(s)} className="text-muted-foreground hover:text-primary">
                        <Download className="w-4 h-4 mr-1" />
                        Report
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No submissions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
