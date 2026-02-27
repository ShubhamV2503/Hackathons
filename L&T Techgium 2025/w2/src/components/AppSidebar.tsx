import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileUp, Ruler, Code2, BarChart3,
  Bot, Settings, ChevronLeft, ChevronRight, Sparkles, BookCheck, LogOut, Brain
} from "lucide-react";
import { useAuth, UserRole } from "@/context/AuthContext";

interface NavItem {
  label: string;
  icon: any;
  path: string;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Assignments", icon: BookCheck, path: "/assignments" },
  { label: "Submissions", icon: FileUp, path: "/submissions", roles: ["student"] },
  { label: "Rubric Builder", icon: Ruler, path: "/rubric-builder", roles: ["instructor"] },
  { label: "Analytics", icon: BarChart3, path: "/analytics", roles: ["instructor"] },
  { label: "AI Coach", icon: Bot, path: "/ai-coach", roles: ["student"] },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNavItems = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen sticky top-0 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-accent overflow-hidden z-50"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-sidebar-accent">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-lg text-white tracking-tight"
            >
              MindFlow
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {filteredNavItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${active ? "sidebar-item-active" : "sidebar-item-inactive"}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Logout & Collapse */}
      <div className="pb-4 border-t border-sidebar-accent pt-4 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full mx-3 sidebar-item sidebar-item-inactive justify-start text-destructive hover:bg-destructive/10"
          style={{ width: "calc(100% - 1.5rem)" }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full mx-3 sidebar-item sidebar-item-inactive justify-center"
          style={{ width: "calc(100% - 1.5rem)" }}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
