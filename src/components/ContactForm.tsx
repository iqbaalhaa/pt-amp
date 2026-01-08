"use client";

import { useState } from "react";
import { createInquiry } from "@/actions/inquiry-actions";

export function ContactForm() {
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
      <h3 className="text-2xl font-bold mb-6 text-zinc-900">Kirim Pesan</h3>
      
      {status === "success" ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-100">
          <p className="font-medium">Pesan terkirim!</p>
          <p className="text-sm mt-1">Terima kasih telah menghubungi kami. Kami akan membalas secepatnya.</p>
          <button 
            onClick={() => setStatus("idle")}
            className="mt-3 text-sm font-medium underline hover:text-green-800"
          >
            Kirim pesan lain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">Nama</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
                placeholder="Nama Lengkap"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1">WhatsApp / Telepon</label>
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
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-zinc-700 mb-1">Subjek</label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
              placeholder="Perihal pesan..."
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-1">Pesan</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all resize-none"
              placeholder="Tulis pesan anda disini..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-[var(--brand)] text-white font-medium py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Mengirim..." : "Kirim Pesan"}
          </button>
        </form>
      )}
    </div>
  );
}
