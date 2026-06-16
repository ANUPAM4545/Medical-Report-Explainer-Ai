import { FileText, Menu } from "lucide-react";
import type { Citation } from "../types/api";

export function CitationInspector({
  citations,
  isOpen,
  onToggle,
}: {
  citations: Citation[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  if (!isOpen) {
    return (
      <aside className="h-full border-t border-border bg-background py-4 px-2 lg:border-l lg:border-t-0 flex flex-col items-center justify-start transition-all duration-300 w-full">
        <button
          type="button"
          onClick={onToggle}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
          title="Expand citations panel"
          aria-label="Expand citations panel"
        >
          <Menu className="h-5 w-5 animate-pulse" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="h-full border-t border-border bg-background p-4 lg:border-l lg:border-t-0 transition-all duration-300 w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-base font-semibold">Citations</h2>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          title="Collapse citations"
          aria-label="Collapse citations"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      {citations.length === 0 ? (
        <p className="text-sm text-muted-foreground">Citations from report pages will appear here after each answer.</p>
      ) : (
        <div className="space-y-3">
          {citations.map((citation) => (
            <article key={`${citation.document_name}-${citation.page_number}-${citation.chunk_index}`} className="rounded-md border border-border p-3">
              <p className="text-sm font-medium">{citation.document_name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Page {citation.page_number} · Chunk {citation.chunk_index}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{citation.preview}</p>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
