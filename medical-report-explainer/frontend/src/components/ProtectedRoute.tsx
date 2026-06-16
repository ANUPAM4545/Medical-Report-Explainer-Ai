import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-sm text-muted-foreground">Checking access...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
