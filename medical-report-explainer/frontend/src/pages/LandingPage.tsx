import { Link } from "react-router-dom";
import { ArrowRight, FileSearch, Languages, ShieldCheck, FileText, Activity, CheckCircle2 } from "lucide-react";

export function LandingPage() {
  const steps = [
    {
      num: "01",
      title: "Secure PDF Upload",
      desc: "Upload lab tests or imaging panels (up to 20 MB per PDF). Scanned images are processed via an OCR (Optical Character Recognition) fallback system to capture all medical text."
    },
    {
      num: "02",
      title: "Page-by-Page Indexing",
      desc: "The system segments reports page-by-page, generating vector embeddings to map key parameters, units, and ranges for precise retrieval."
    },
    {
      num: "03",
      title: "Interactive Explanations",
      desc: "Ask questions about values, terminology, or trends. Receive detailed, citation-backed answers in English, Hindi, or both languages side-by-side."
    },
    {
      num: "04",
      title: "Clinical Discussions",
      desc: "Review abnormal markers, common educational causes, and get a list of targeted discussion questions to print and bring to your doctor."
    }
  ];

  return (
    <main className="animate-fade-in-up">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-br from-teal-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950">
        <div className="mx-auto grid min-h-[calc(100vh-144px)] max-w-7xl items-center gap-8 px-4 py-10 sm:min-h-[calc(100vh-104px)] sm:py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-md border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-teal-800 dark:border-teal-800 dark:bg-slate-950 dark:text-teal-200">
              <ShieldCheck className="h-4 w-4" />
              <span className="truncate">Safety-first healthcare education</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl">
              Understand your medical reports in simple terms
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-200 sm:text-lg sm:leading-8">
              An educational AI assistant that explains complex terminology, reference ranges, and lab markers from your medical reports. Supports English, Hindi, and bilingual side-by-side translations.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/workspace"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted"
              >
                Open workspace
              </Link>
            </div>
          </div>
          <div className="rounded-md border border-border bg-white/90 p-6 shadow-soft dark:bg-slate-950/90">
            <h2 className="text-lg font-bold mb-4">Supported Report Formats</h2>
            <div className="grid gap-4">
              {[
                ["Complete Blood Count (CBC)", "Understand hemoglobin levels, white blood cells, platelets, and what high or low differential counts imply."],
                ["Lipid Panel / Cholesterol", "Get educational explanations of HDL, LDL, VLDL, and total triglycerides with contributing lifestyle factors."],
                ["Liver & Kidney Panels (LFT / KFT)", "Learn the roles of bilirubin, SGOT, SGPT, creatinine, and urea, mapped against normal reference ranges."],
                ["Imaging Terminology (MRI, CT, X-Ray)", "Translates complex radiological descriptions and structural findings into accessible plain language."]
              ].map(([title, copy]) => (
                <div key={title} className="rounded-md border border-border p-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    {title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-5">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step Explanation */}
      <section className="border-b border-border bg-muted/10 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-7">
              Medical Explainer AI uses advanced semantic RAG (Retrieval-Augmented Generation) technology to process, index, and query your records securely.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="relative rounded-xl border border-border bg-background p-6 shadow-soft">
                <div className="text-3xl font-extrabold text-teal-600/20 dark:text-teal-400/20 absolute right-6 top-6">{step.num}</div>
                <h3 className="font-bold text-base pr-8">{step.title}</h3>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-6">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-3">
        <div className="rounded-md border border-border p-6 bg-background">
          <FileSearch className="h-6 w-6 text-indigo-600" />
          <h2 className="mt-3 font-semibold text-base">Page-Specific Citations</h2>
          <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">Every statement includes citations back to the source file name, page numbers, and snippet previews, allowing you to double-check every detail.</p>
        </div>
        <div className="rounded-md border border-border p-6 bg-background">
          <Languages className="h-6 w-6 text-indigo-600" />
          <h2 className="mt-3 font-semibold text-base">Bilingual Hindi & English</h2>
          <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">Ask in English or Hindi and read responses in either language, or side-by-side bilingual summaries to help all members of the family.</p>
        </div>
        <div className="rounded-md border border-border p-6 bg-background">
          <ShieldCheck className="h-6 w-6 text-indigo-600" />
          <h2 className="mt-3 font-semibold text-base">Strict Safety Guardrails</h2>
          <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">This AI does not diagnose illnesses, prescribe medication, suggest treatments, or offer prognosis. It serves only as a medical education library.</p>
        </div>
      </section>
    </main>
  );
}
