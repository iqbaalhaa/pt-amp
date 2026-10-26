import { DynamicIcon } from "@/components/DynamicIcon";
import { getDictionary, type Locale } from "@/lib/i18n";

export interface ProcessStep {
  id?: string;
  title: string;
  description: string;
  icon: string | null;
  image: string | null;
}

export function ProcessSection({
  steps,
  locale = "id",
}: {
  steps: ProcessStep[];
  locale?: Locale;
}) {
  const t = getDictionary(locale).process;
  return (
    <section id="process" className="py-20 bg-white border-t border-zinc-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">
            {t.title}
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            {t.description}
          </p>
        </div>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, idx) => (
            <li
              key={step.id ?? step.title}
              className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-zinc-100 flex items-center justify-center text-zinc-400">
                {step.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DynamicIcon name={step.icon || "Package"} className="w-12 h-12" />
                )}
                <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[var(--brand)] text-white text-sm font-semibold flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2 text-zinc-900">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
