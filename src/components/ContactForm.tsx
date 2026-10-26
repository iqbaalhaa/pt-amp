"use client";

import { useState } from "react";
import { createInquiry } from "@/actions/inquiry-actions";
import { getDictionary, type Locale } from "@/lib/i18n";

export function ContactForm({ locale = "id" }: { locale?: Locale }) {
  const t = getDictionary(locale).contactForm;
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    
    const formData = new FormData(event.currentTarget);
    try {
      await createInquiry(formData);
      setStatus("success");
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
      <h3 className="text-2xl font-bold mb-6 text-zinc-900">{t.title}</h3>
      
      {status === "success" ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-100">
          <p className="font-medium">{t.sent}</p>
          <p className="text-sm mt-1">{t.thanks}</p>
          <button 
            onClick={() => setStatus("idle")}
            className="mt-3 text-sm font-medium underline hover:text-green-800"
          >
            {t.another}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">{t.name}</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
                placeholder={t.namePlaceholder}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1">{t.phone}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
                placeholder="0812..."
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">{t.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
              placeholder={t.emailPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-zinc-700 mb-1">{t.subject}</label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
              placeholder={t.subjectPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-1">{t.message}</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all resize-none"
              placeholder={t.messagePlaceholder}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-[var(--brand)] text-white font-medium py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? t.sending : t.send}
          </button>
        </form>
      )}
    </div>
  );
}
