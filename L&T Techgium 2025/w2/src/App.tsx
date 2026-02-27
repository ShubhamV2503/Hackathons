import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Submissions from "./pages/Submissions";
import RubricBuilder from "./pages/RubricBuilder";

import Analytics from "./pages/Analytics";
import AICoach from "./pages/AICoach";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { AssignmentProvider } from "./context/AssignmentContext";
import { RubricProvider } from "./context/RubricContext";
import { AuthProvider } from "./context/AuthContext";
import Assignments from "./pages/Assignments";

const queryClient = new QueryClient();

const App = () => (
  <>

    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AssignmentProvider>
          <RubricProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/assignments" element={<AppLayout><Assignments /></AppLayout>} />
                  <Route path="/submissions" element={<AppLayout><Submissions /></AppLayout>} />
                  <Route path="/rubric-builder" element={<AppLayout><RubricBuilder /></AppLayout>} />

                  <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
                  <Route path="/ai-coach" element={<AppLayout><AICoach /></AppLayout>} />
                  <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RubricProvider>
        </AssignmentProvider>
      </AuthProvider>
    </QueryClientProvider>
  </>
);

export default App;
