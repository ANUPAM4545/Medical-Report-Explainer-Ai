import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

export function FileUpload({
  onFiles,
  progress,
  uploading,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  progress: number;
  uploading: boolean;
  compact?: boolean;
}) {
  const onDrop = useCallback((acceptedFiles: File[]) => onFiles(acceptedFiles), [onFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"]
    },
    multiple: true,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed text-center transition ${
        compact ? "p-4" : "p-8"
      } ${
        isDragActive ? "border-primary bg-teal-50 dark:bg-teal-950" : "border-border bg-background hover:bg-muted"
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud className={`mx-auto text-primary ${compact ? "h-7 w-7" : "h-10 w-10"}`} aria-hidden="true" />
      <p className={`mt-2 font-semibold ${compact ? "text-xs" : "text-sm"}`}>
        {compact ? "Upload PDF or scan/image here" : "Drop PDF/images or scan with phone camera"}
      </p>
      {!compact && (
        <p className="mt-1 text-xs text-muted-foreground">
          Supports PDFs & images (PNG, JPG) up to 20 MB. Phone camera scans supported.
        </p>
      )}
      {uploading && (
        <div className="mt-3 h-1.5 overflow-hidden rounded bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
