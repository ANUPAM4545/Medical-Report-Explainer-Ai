import { FormEvent, useState } from "react";
import { Mail, MapPin, MessageSquareText, Phone } from "lucide-react";

export function ContactPage() {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr]">
      <section>
        <h1 className="text-4xl font-bold sm:text-5xl">Contact</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          For product questions, deployment help, or premium access support, send a message. Do not share urgent medical
          details here; contact a qualified healthcare professional for medical concerns.
        </p>
        <div className="mt-8 grid gap-3 text-sm">
          <div className="flex items-center gap-3 rounded-md border border-border p-4">
            <Mail className="h-5 w-5 text-primary" />
            support@medicalreportexplainer.ai
          </div>
          <div className="flex items-center gap-3 rounded-md border border-border p-4">
            <Phone className="h-5 w-5 text-primary" />
            Premium support for subscribed users
          </div>
          <div className="flex items-center gap-3 rounded-md border border-border p-4">
            <MapPin className="h-5 w-5 text-primary" />
            Remote-first healthcare education platform
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border p-5 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Send a message</h2>
        </div>
        {sent ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-50">
            Thanks. Your message has been captured in this demo contact flow.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input type="email" className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Message</span>
              <textarea className="mt-2 min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" required />
            </label>
            <button className="h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Submit
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
