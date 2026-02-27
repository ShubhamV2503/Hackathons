import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("instructor");
  const [password, setPassword] = useState("instructor");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (username === "instructor" && password === "instructor") {
        login("instructor", "instructor");
        toast({ title: "Welcome back, Instructor!", description: "You have full access." });
        navigate("/");
      } else if (username === "student" && password === "student") {
        login("student", "student");
        toast({ title: "Welcome, Student!", description: "You have student access." });
        navigate("/");
      } else {
        toast({ title: "Login Failed", description: "Invalid username or password.", variant: "destructive" });
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="max-w-md text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold">MindFlow</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Intelligent evaluation powered by AI</h2>
          <p className="text-lg opacity-90">Upload flowcharts, pseudocode, and algorithms for instant rubrics-based evaluation with AI-powered insights.</p>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MindFlow</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your account</p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="pl-10" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={handleLogin} disabled={isLoading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
              {isLoading ? "Signing In..." : <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
