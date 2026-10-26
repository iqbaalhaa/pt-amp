import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CheckCircle2, Users, Factory, Globe2 } from "lucide-react";
import { getAboutPageData, getFeatureCards } from "@/actions/cms-actions";
import { DynamicIcon } from "@/components/DynamicIcon";
import { AboutMainImage } from "./AboutMainImage";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

export default async function AboutPage({
  locale = "id",
}: {
  locale?: Locale;
}) {
  const [aboutPage, featureCards] = await Promise.all([
    getAboutPageData(),
    getFeatureCards("ABOUT_VALUES"),
  ]);
  const t = getDictionary(locale).about;

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <WhatsAppButton locale={locale} />
      {/* Hero Header */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-[var(--brand)] font-semibold tracking-wider text-sm uppercase mb-3 block">
              {t.eyebrow}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-zinc-900 tracking-tight">
              {aboutPage?.heroTitle || t.heroTitle}
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed max-w-3xl">
              {aboutPage?.heroDescription || t.heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Expanded from Homepage */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-6 text-zinc-900">
                {aboutPage?.mainTitle || t.mainTitle}
              </h2>
              <div className="text-lg text-zinc-600 leading-relaxed mb-8 whitespace-pre-line">
                {aboutPage?.mainDescription || t.mainDescription}
              </div>

              <div className="flex flex-col gap-3">
                {aboutPage?.points && aboutPage.points.length > 0 ? (
                  aboutPage.points.map((point) => (
                    <div key={point.id} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--brand)]" />
                      <span className="text-zinc-700 font-medium">
                        {point.text}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--brand)]" />
                      <span className="text-zinc-700 font-medium">
                        {t.points[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--brand)]" />
                      <span className="text-zinc-700 font-medium">
                        {t.points[1]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--brand)]" />
                      <span className="text-zinc-700 font-medium">
                        {t.points[2]}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <AboutMainImage image={aboutPage?.mainImage} />
          </div>

          {/* Core Values / Process Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.length > 0 ? (
              featureCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-[var(--brand)]/30 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 text-[var(--brand)]">
                    <DynamicIcon name={card.icon} className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-900">
                    {card.title}
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              ))
            ) : (
              <>
                <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-[var(--brand)]/30 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 text-[var(--brand)]">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-900">
                    {t.values[0].title}
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    {t.values[0].description}
                  </p>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-[var(--brand)]/30 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 text-[var(--brand)]">
                    <Factory className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-900">
                    {t.values[1].title}
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    {t.values[1].description}
                  </p>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-[var(--brand)]/30 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 text-[var(--brand)]">
                    <Globe2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-900">
                    {t.values[2].title}
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    {t.values[2].description}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">
              {t.ctaTitle}
            </h3>
            <Link
              href={localePath(locale, "/contact")}
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white rounded-full bg-[var(--brand)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              {t.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
