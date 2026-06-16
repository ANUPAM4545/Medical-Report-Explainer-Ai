import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Activity, LogOut, Lock } from "lucide-react";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeToggle } from "./components/ThemeToggle";
import { AuthProvider, useAuth } from "./lib/auth";
import { AuthPage } from "./pages/AuthPage";
import { ContactPage } from "./pages/ContactPage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { LandingPage } from "./pages/LandingPage";
import { UploadPage } from "./pages/UploadPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { DashboardPage } from "./pages/DashboardPage";

function AppShell() {
  const [dark, setDark] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <DisclaimerBanner />
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap">
          <Link to={user ? "/workspace" : "/"} className="flex min-w-0 items-center gap-2 font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </span>
            <span className="truncate">Medical Report Explainer AI</span>
          </Link>
          <nav className="flex w-full flex-wrap items-center gap-2 text-sm font-medium sm:w-auto sm:justify-end">
            {!user ? (
              <>
                <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/">
                  Home
                </Link>
                <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/features">
                  Features
                </Link>
                <Link className="rounded-md px-3 py-2 hover:bg-muted" to="/contact">
                  Contact
                </Link>
                <Link className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-muted" to="/auth">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Workspace</span>
                </Link>
                <Link 
                  className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow hover:bg-indigo-700 active:bg-indigo-800 transition-colors" 
                  to="/auth"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-foreground">{user.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-10 px-4 items-center justify-center gap-2 rounded-md border border-border hover:bg-muted text-sm font-semibold text-red-500 transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
            <ThemeToggle dark={dark} onToggle={() => setDark((value) => !value)} />
          </nav>
        </div>
      </header>
      <div className="flex-1">
        <Routes>
          {user ? (
            <>
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="*" element={<Navigate to="/workspace" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </>
          )}
        </Routes>
      </div>
      {!user && (
        <footer className="border-t border-border bg-background py-6 mt-auto">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Medical Report Explainer AI. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Made with <span className="text-red-500 animate-pulse">❤️</span> by <span className="font-semibold text-foreground">Anupam Singh</span>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
