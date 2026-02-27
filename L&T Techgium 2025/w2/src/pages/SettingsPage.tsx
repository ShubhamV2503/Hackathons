import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const isInstructor = user?.role === "instructor";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6">
        <h3 className="font-semibold text-foreground">Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
            <Input
              value={isInstructor ? "Instructor" : "Student"}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <Input
              value={isInstructor ? "instructor@mindflow.com" : "student@mindflow.com"}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Role</label>
          <Input
            value={isInstructor ? "Instructor" : "Student"}
            disabled
            className="bg-muted text-muted-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground italic">
          Profile details are managed by the administrator and cannot be changed.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-6">
        <h3 className="font-semibold text-foreground">Data Management</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Reset Submissions</p>
            <p className="text-sm text-muted-foreground">Clear all student submissions and evaluations.</p>
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete all submissions? This cannot be undone.")) {
                localStorage.removeItem("rubric_ai_evaluations");
                window.dispatchEvent(new Event("storage"));
                window.dispatchEvent(new Event("rubric_ai_evaluations_updated"));
                toast({
                  title: "Data Reset",
                  description: "All submissions and evaluations have been cleared.",
                });
              }
            }}
          >
            Reset All Data
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
