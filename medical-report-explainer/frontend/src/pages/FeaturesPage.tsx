import { 
  FileText, 
  Send, 
  Languages, 
  ShieldCheck, 
  Lock, 
  Scan, 
  Database, 
  Printer, 
  EyeOff,
  LayoutDashboard
} from "lucide-react";

export function FeaturesPage() {
  const coreFeatures = [
    {
      title: "PDF Report Extraction",
      desc: "Upload multiple medical reports (CBC, Liver/Kidney tests, Lipid profiles, CT scans, MRIs) and extract text instantly.",
      icon: FileText
    },
    {
      title: "OCR For Scanned Reports",
      desc: "Automatic OCR fallback using Tesseract. Extracts texts from low-quality or scanned document images seamlessly.",
      icon: Scan
    },
    {
      title: "Bilingual Explanations",
      desc: "Choose between English, Hindi (हिन्दी), or a side-by-side bilingual response for any medical term or marker.",
      icon: Languages
    },
    {
      title: "Strict Safety Guardrails",
      desc: "Explains parameters and values cautiously. Never diagnoses, prescribes, recommends doses, or replaces a doctor.",
      icon: ShieldCheck
    }
  ];

  const recentFeatures = [
    {
      title: "Visual Workspace Locking",
      desc: "Navbar displays a locked workspace status. Secure sign-in screens protect data access for authenticated users.",
      icon: Lock
    },
    {
      title: "User Profile Dashboard",
      desc: "A separate, dedicated profile section. View your credentials, storage details, and manage uploaded reports.",
      icon: LayoutDashboard
    },
    {
      title: "Auto-Compressing Safety Banner",
      desc: "Bilingual warning header collapses after 10s into a pulsating glowing shield icon; re-expands for 6s on click.",
      icon: EyeOff
    },
    {
      title: "Persistent SQL History",
      desc: "Your questions and explanations are recorded in a SQLite database and automatically restored when you reload.",
      icon: Database
    },
    {
      title: "Premium Print Summaries",
      desc: "Generates formatted layout records with patient metadata, structured Q&As, and disclaimers for print-to-PDF saving.",
      icon: Printer
    }
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 animate-fade-in-up">
      <section className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50/50 px-3 py-2 text-sm font-medium text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-200">
          <ShieldCheck className="h-4 w-4" />
          Patient Education Platform
        </div>
        <h1 className="mt-5 text-4xl font-bold sm:text-5xl tracking-tight">Platform Features</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          Medical Report Explainer AI translates complex lab and imaging language into clear, cited explanations while keeping clinical decisions with doctors.
        </p>
      </section>

      {/* Core Features */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight border-b border-border/60 pb-3">Core Platform Capability</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <article key={feat.title} className="rounded-xl border border-border bg-background p-5 shadow-soft hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-base">{feat.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feat.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Recent Features */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight border-b border-border/60 pb-3">Recent Interface & Security Updates</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <article key={feat.title} className="rounded-xl border border-border bg-muted/20 p-5 shadow-soft hover:shadow-md transition-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-base">{feat.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feat.desc}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
