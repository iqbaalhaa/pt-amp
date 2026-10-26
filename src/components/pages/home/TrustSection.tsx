import { DynamicIcon } from "@/components/DynamicIcon";
import { getDictionary, type Locale } from "@/lib/i18n";

type TrustItem = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
};

// Hidden when the CMS has no stats and no certifications (no made-up claims).
export function TrustSection({
  stats,
  certifications,
  locale = "id",
}: {
  stats: TrustItem[];
  certifications: TrustItem[];
  locale?: Locale;
}) {
  const t = getDictionary(locale).trust;
  if (stats.length === 0 && certifications.length === 0) return null;

  return (
    <section id="trust" className="py-16 bg-zinc-900 text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        {stats.length > 0 && (
          <div className="flex flex-wrap justify-center gap-y-8 text-center">
            {stats.map((stat) => (
              <div key={stat.id} className="w-1/2 lg:w-1/4 px-3">
                <div className="text-3xl md:text-4xl font-bold text-[var(--brand)] break-words">
                  {stat.title}
                </div>
                <div className="mt-2 text-sm md:text-base text-zinc-300">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              {t.certificationsTitle}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] flex items-start gap-4 rounded-xl border border-zinc-700 bg-zinc-800/60 p-5"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                    <DynamicIcon
                      name={cert.icon || "CheckCircle2"}
                      className="w-5 h-5 text-[var(--brand)]"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{cert.title}</div>
                    {cert.description && (
                      <div className="text-sm text-zinc-300 mt-1">
                        {cert.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
