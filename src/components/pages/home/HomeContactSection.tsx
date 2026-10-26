import Link from "next/link";
import { ArrowLink } from "@/components/ArrowLink";
import { ContactForm } from "@/components/ContactForm";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

export function HomeContactSection({ locale = "id" }: { locale?: Locale }) {
  const t = getDictionary(locale).homeContact;

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-brand mb-4">
              {t.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-zinc-900">
              {t.title}
            </h2>
            <p className="text-lg text-zinc-600 mb-4 leading-relaxed">
              {t.description}
            </p>
            <ArrowLink href={localePath(locale, "/contact")} className="inline-flex items-center text-brand font-medium hover:underline mb-8">
              {t.fullInfo}
            </ArrowLink>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-brand">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                    {t.warehouse}
                  </h3>
                  <p className="text-zinc-600">
                    Jl. Raya Padang - Solok, KM 20, Indarung, Padang, Sumatera
                    Barat
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-brand">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                    {t.phone}
                  </h3>
                  <p className="text-zinc-600">+62 812 3456 7890</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {t.hours}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-brand">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                    {t.email}
                  </h3>
                  <p className="text-zinc-600">contact@ptamp.com</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <ContactForm locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
