import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, FileText, Calendar, Mail, Shield, Trash2, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteDocument, getDocuments } from "../lib/api";
import { useAuth } from "../lib/auth";

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const documentsQuery = useQuery({ 
    queryKey: ["documents"], 
    queryFn: getDocuments 
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const totalReports = documentsQuery.data?.length ?? 0;
  const totalChunks = documentsQuery.data?.reduce((sum, doc) => sum + doc.chunks, 0) ?? 0;

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 animate-fade-in-up">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your medical reports, account credentials, and assistant access.</p>
        </div>
        <Link 
          to="/workspace" 
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Go to Chat Workspace <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Card */}
        <section className="col-span-1 rounded-md border border-border bg-muted/35 p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>Verified Account</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4 border-t border-border/60 pt-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="truncate font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Account Status</p>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Registered Role</p>
                <p className="font-medium">Standard User</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats and Reports Grid */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Reports Uploaded</p>
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold">{totalReports}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Indexed Chunks</p>
                <User className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold">{totalChunks}</p>
            </div>
          </div>

          {/* Reports Management */}
          <section className="rounded-md border border-border bg-background p-6 shadow-soft">
            <h2 className="text-lg font-bold">Uploaded Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">Here is a list of your processed medical report files. Deleting a report removes its data from our storage and the vector database.</p>
            
            <div className="mt-6 divide-y divide-border/60">
              {documentsQuery.isLoading ? (
                <p className="py-4 text-sm text-muted-foreground">Loading your reports...</p>
              ) : (documentsQuery.data ?? []).length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No reports uploaded yet. Head to the workspace or upload page to index a report.</p>
              ) : (
                (documentsQuery.data ?? []).map((doc) => (
                  <div key={doc.filename} className="flex items-center justify-between py-4 gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="break-all font-medium text-sm">{doc.filename}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {doc.chunks} chunks · pages: {doc.pages.join(", ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-md border border-border p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      onClick={() => deleteMutation.mutate(doc.filename)}
                      title="Delete report"
                      aria-label={`Delete ${doc.filename}`}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
