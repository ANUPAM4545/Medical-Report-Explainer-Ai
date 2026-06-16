import { FormEvent, useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Send, Trash2, Menu } from "lucide-react";
import { CitationInspector } from "../components/CitationInspector";
import { LanguageSelector } from "../components/LanguageSelector";
import { FileUpload } from "../components/FileUpload";
import { askReport, deleteDocument, getDocuments, getHistory, clearHistory, uploadReports } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Citation, Language } from "../types/api";

interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

export function WorkspacePage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>("both");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [reportsOpen, setReportsOpen] = useState(true);
  const [citationsOpen, setCitationsOpen] = useState(true);
  
  const queryClient = useQueryClient();
  
  const documentsQuery = useQuery({ queryKey: ["documents"], queryFn: getDocuments });
  const historyQuery = useQuery({ queryKey: ["history", language], queryFn: () => getHistory(language) });

  const chatMutation = useMutation({
    mutationFn: (prompt: string) => askReport(prompt, language, language),
    onSuccess: (response) => {
      setMessages((current) => [...current, { role: "assistant", content: response.answer }]);
      setCitations(response.citations);
      queryClient.invalidateQueries({ queryKey: ["history", language] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadReports(files, setUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => clearHistory(language),
    onSuccess: () => {
      setMessages([]);
      setCitations([]);
      queryClient.invalidateQueries({ queryKey: ["history", language] });
    },
  });

  const history = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);

  // Restore persistent chat history into the workspace window whenever language session changes
  useEffect(() => {
    setMessages(
      history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))
    );
    setCitations([]);
  }, [history]);

  const canExport = messages.length > 0;
  
  const exportSummary = () => {
    if (messages.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const itemsHtml = messages
      .map(
        (msg) => `
      <div class="message-card ${msg.role}">
        <div class="message-header">
          <span class="role-badge ${msg.role}">${msg.role === "user" ? "Patient Question / रोगी का प्रश्न" : "Educational Explanation / स्पष्टीकरण"}</span>
        </div>
        <div class="message-content">${msg.content.replace(/\n/g, "<br/>")}</div>
      </div>
    `
      )
      .join("");

    const documentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Report Explainer AI Summary</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            margin: 0;
            padding: 40px 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 22px;
            font-weight: 800;
            color: #0d9488;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .date {
            font-size: 13px;
            color: #64748b;
          }
          .disclaimer-box {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 30px;
            font-size: 12px;
            color: #78350f;
          }
          .disclaimer-box p {
            margin: 0 0 8px 0;
          }
          .disclaimer-box p:last-child {
            margin: 0;
          }
          .message-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .message-card.user {
            background-color: #f8fafc;
            border-left: 4px solid #64748b;
          }
          .message-card.assistant {
            background-color: #ffffff;
            border-left: 4px solid #0d9488;
          }
          .message-header {
            margin-bottom: 12px;
          }
          .role-badge {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 4px 8px;
            border-radius: 4px;
          }
          .role-badge.user {
            background-color: #e2e8f0;
            color: #475569;
          }
          .role-badge.assistant {
            background-color: #ccfbf1;
            color: #0f766e;
          }
          .message-content {
            font-size: 13.5px;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span>🩺 Medical Report Explainer AI</span>
            </div>
            <div class="date">
              Report Generated: ${new Date().toLocaleDateString()}
            </div>
          </div>
          
          <div class="disclaimer-box">
            <p><strong>Bilingual Medical Education Disclaimer / चिकित्सा शिक्षा डिस्क्लेमर:</strong></p>
            <p>This document is a printed record of educational explanations generated by AI regarding medical reports. This document is for educational purposes only and does NOT constitute professional medical advice, diagnosis, treatment, or clinical decisions.</p>
            <p>यह दस्तावेज़ मेडिकल रिपोर्ट के बारे में एआई द्वारा उत्पन्न शैक्षिक स्पष्टीकरण का एक मुद्रित रिकॉर्ड है। यह केवल शैक्षिक उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह, निदान, उपचार, या नैदानिक निर्णय का गठन नहीं करता है।</p>
          </div>

          <div class="chat-items">
            ${itemsHtml}
          </div>

          <div class="footer">
            Generated using Medical Report Explainer AI Platform. Educating patients, one report at a time.
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(documentHtml);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setQuestion("");
    chatMutation.mutate(trimmed);
  }

  return (
    <main 
      className={`grid min-h-[calc(100vh-80px)] grid-cols-1 lg:min-h-[calc(100vh-64px)] transition-all duration-300 ${
        reportsOpen && citationsOpen
          ? "lg:grid-cols-[280px_1fr_340px]"
          : !reportsOpen && citationsOpen
          ? "lg:grid-cols-[60px_1fr_340px]"
          : reportsOpen && !citationsOpen
          ? "lg:grid-cols-[280px_1fr_60px]"
          : "lg:grid-cols-[60px_1fr_60px]"
      } animate-fade-in-up`}
    >
      {/* Reports Sidebar (Left Panel) */}
      {reportsOpen ? (
        <aside className="order-2 border-t border-border bg-muted/35 p-4 lg:order-1 lg:border-r lg:border-t-0 flex flex-col justify-between overflow-y-auto w-full transition-all duration-300">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                <h2 className="font-semibold text-sm tracking-wide">REPORTS</h2>
              </div>
              <button
                type="button"
                onClick={() => setReportsOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Collapse reports panel"
                aria-label="Collapse reports panel"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(documentsQuery.data ?? []).map((doc) => (
                <div key={doc.filename} className="rounded-md border border-border bg-background p-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="break-all font-medium text-slate-800 dark:text-slate-200">{doc.filename}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{doc.chunks} chunks · pages {doc.pages.join(", ")}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                      onClick={() => deleteMutation.mutate(doc.filename)}
                      title="Delete report"
                      aria-label={`Delete ${doc.filename}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {documentsQuery.data?.length === 0 && <p className="text-xs text-muted-foreground">No reports uploaded yet.</p>}
            </div>

            {/* Compact File Uploader */}
            <div>
              <FileUpload
                compact={true}
                progress={uploadProgress}
                uploading={uploadMutation.isPending}
                onFiles={(files) => {
                  setUploadProgress(0);
                  uploadMutation.mutate(files);
                }}
              />
            </div>

            <div>
              <h2 className="font-semibold text-sm tracking-wide mb-3">ACTIVE SESSION</h2>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {messages.slice(-2).map((item, index) => (
                  <div key={`${item.role}-${index}`} className="rounded-md border border-border bg-background p-2.5 text-[11px] leading-4">
                    <p className="font-bold uppercase tracking-wider text-[9px] text-muted-foreground">{item.role}</p>
                    <p className="line-clamp-2 text-slate-600 dark:text-slate-300 mt-0.5">{item.content}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages in active session.</p>}
              </div>
            </div>
          </div>

          {/* Credentials / Profile Box */}
          {user && (
            <div className="mt-6 border-t border-border/70 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      ) : (
        <aside className="order-2 border-t border-border bg-muted/35 py-4 px-2 lg:order-1 lg:border-r lg:border-t-0 flex flex-col items-center justify-between overflow-y-auto w-full transition-all duration-300">
          <div>
            <button
              type="button"
              onClick={() => setReportsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
              title="Expand reports panel"
              aria-label="Expand reports panel"
            >
              <Menu className="h-5 w-5 animate-pulse" />
            </button>
          </div>
          
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground" title={user.name}>
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </aside>
      )}

      {/* Main Workspace Chat */}
      <section className="order-1 flex min-h-[620px] flex-col bg-background lg:order-2">
        <header className="grid gap-3 border-b border-border p-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">Chat workspace</h1>
            <p className="text-sm text-muted-foreground">Ask educational questions about uploaded report content.</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector value={language} onChange={setLanguage} />
            <button
              type="button"
              disabled={!canExport}
              onClick={exportSummary}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              title="Export summary as PDF"
              aria-label="Export summary as PDF"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={messages.length === 0}
              onClick={() => clearHistoryMutation.mutate()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-red-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950/20"
              title="Clear chat history"
              aria-label="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
          {messages.length === 0 && (
            <div className="rounded-md border border-border bg-muted/40 p-5">
              <p className="font-medium">Try asking: “Explain abnormal values in my report.”</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Responses are generated only from retrieved report context and include citations in the right panel.
              </p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-3xl rounded-md border p-3 leading-7 sm:p-4 ${
                message.role === "user"
                  ? "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950 sm:ml-auto"
                  : "border-border bg-muted/35"
              }`}
            >
              <div className="whitespace-pre-wrap break-words text-sm">{message.content}</div>
            </div>
          ))}
          {chatMutation.isPending && <p className="text-sm text-muted-foreground">Generating a cautious educational explanation...</p>}
          {chatMutation.isError && (
            <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
              The answer could not be generated. Check backend logs and Gemini API configuration.
            </p>
          )}
        </div>

        <form onSubmit={submit} className="border-t border-border p-3 sm:p-4">
          <div className="flex gap-2">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={2}
              className="min-h-14 min-w-0 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ask about report terms, abnormal markers, reference ranges, or doctor discussion questions..."
            />
            <button
              type="submit"
              disabled={chatMutation.isPending}
              className="inline-flex w-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              title="Send"
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </section>

      {/* Citations panel (Right Panel) */}
      <div className="order-3 lg:order-3 flex">
        <CitationInspector 
          citations={citations} 
          isOpen={citationsOpen}
          onToggle={() => setCitationsOpen(!citationsOpen)}
        />
      </div>
    </main>
  );
}
