import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { FileUpload } from "../components/FileUpload";
import { uploadReports } from "../lib/api";

export function UploadPage() {
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadReports(files, setProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload medical reports</h1>
        <p className="mt-2 text-muted-foreground">PDF reports are extracted, chunked page-by-page, embedded, and stored in ChromaDB.</p>
      </div>
      <FileUpload
        progress={progress}
        uploading={uploadMutation.isPending}
        onFiles={(files) => {
          setProgress(0);
          uploadMutation.mutate(files);
        }}
      />
      {uploadMutation.isSuccess && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-50">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-5 w-5" />
            {uploadMutation.data.message}
          </div>
          <p className="mt-2 text-sm">{uploadMutation.data.chunks_indexed} chunks indexed from {uploadMutation.data.filenames.join(", ")}.</p>
          <Link to="/workspace" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Ask questions
          </Link>
        </div>
      )}
      {uploadMutation.isError && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
          Upload failed. Check backend configuration, GEMINI_API_KEY, and PDF format.
        </p>
      )}
    </main>
  );
}
