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
        <h1 className="text-4xl font-bold sm:text-5xl">Get in Touch</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Have questions about the platform, feedback, or need deployment assistance? Drop us a line. 
          Please note that this is an educational platform; do not share urgent medical details here and 
          always consult a qualified healthcare professional for medical concerns.
        </p>
        <div className="mt-8 grid gap-3 text-sm">
          <div className="flex items-center gap-3 rounded-md border border-border p-4">
            <Mail className="h-5 w-5 text-primary" />
            <a href="mailto:anupamsingh8095@gmail.com" className="hover:underline text-foreground">
              anupamsingh8095@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-border p-4">
            <MapPin className="h-5 w-5 text-primary" />
            Remote-First Healthcare Education
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border p-5 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Send us a message</h2>
        </div>
        {sent ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-50">
            Thank you for reaching out! Your message has been sent successfully. We will get back to you shortly.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Your Name</span>
              <input className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Your Email Address</span>
              <input type="email" className="mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="john@company.com" required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">How can we help you?</span>
              <textarea className="mt-2 min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Type your message here..." required />
            </label>
            <button className="h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
