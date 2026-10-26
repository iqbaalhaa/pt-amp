import { Navbar } from "@/components/Navbar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { HeroCarousel, HeroSlide } from "@/components/HeroCarousel";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublicItemTypes } from "@/actions/item-type-actions";
import { latestPosts } from "@/lib/blog";
import { ArrowLink } from "@/components/ArrowLink";
import {
  getHomePageData,
  getHeroSlides,
  getFeatureCards,
  getGalleryAlbums,
} from "@/actions/cms-actions";
import { DynamicIcon } from "@/components/DynamicIcon";
import { ProductCardImage } from "./ProductCardImage";
import { StaticProductCards } from "./StaticProductCards";

import { HomeGallerySection } from "./HomeGallerySection";
import { HomeBlogSection } from "./HomeBlogSection";
import { TrustSection } from "./TrustSection";
import { HOME_ABOUT, HOME_CERTIFICATIONS, HOME_STATS } from "@/lib/cms-sections";
import { HomeContactSection } from "./HomeContactSection";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { ProcessSection } from "./ProcessSection";
import { PROCESS_SECTION, resolveProcessSteps } from "@/lib/process-default";
import { ProductSpecTable } from "@/components/products/ProductSpecTable";
import { buildProductSpecRows } from "@/lib/product-specs";

export default async function HomePage({
  locale = "id",
}: {
  locale?: Locale;
}) {
  const t = getDictionary(locale).home;
  const [
    allProducts,
    homePage,
    slides,
    featureCards,
    posts,
    allAlbums,
    stats,
    certifications,
    processCards,
  ] = await Promise.all([
    getPublicItemTypes(),
    getHomePageData(),
    getHeroSlides(),
    getFeatureCards(HOME_ABOUT),
    latestPosts(3),
    getGalleryAlbums(),
    getFeatureCards(HOME_STATS),
    getFeatureCards(HOME_CERTIFICATIONS),
    getFeatureCards(PROCESS_SECTION),
  ]);

  const products = allProducts.slice(0, 3);
  const albums = allAlbums.slice(0, 3);
  const showStatic = products.length === 0;

  // Fallback for slides if empty (optional, but good for safety)
  const finalSlides =
    slides.length > 0 ? (slides as unknown as HeroSlide[]) : [];

  return (
    <div className="min-h-screen font-sans bg-zinc-50">
      <Navbar />
      <WhatsAppButton locale={locale} />

      <HeroCarousel slides={finalSlides} />

      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">
              {homePage?.aboutTitle || t.aboutTitle}
            </h2>
            <p className="text-lg text-zinc-600 leading-relaxed mb-6">
              {homePage?.aboutDescription || t.aboutDescription}
            </p>
            <ArrowLink href={localePath(locale, "/about")} className="inline-flex items-center text-brand font-medium hover:underline">
              {t.aboutMore}
            </ArrowLink>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.length > 0 ? (
              featureCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-xl border border-zinc-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-6 text-brand group-hover:bg-red-100 transition-colors">
                    <DynamicIcon
                      name={card.icon}
                      className="w-6 h-6 text-[var(--brand)]"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-zinc-900">
                    {card.title}
                  </h3>
                  <p className="text-zinc-600">{card.description}</p>
                </div>
              ))
            ) : (
              // Fallback content if no feature cards found
              <>
                <div className="bg-white rounded-xl border border-zinc-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-6 text-brand group-hover:bg-red-100 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--brand)]"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-zinc-900">
                    {t.featureTitle}
                  </h3>
                  <p className="text-zinc-600">
                    {t.featureDescription}
                  </p>
                </div>
                {/* ... other fallbacks ... */}
              </>
            )}
          </div>
        </div>
      </section>

      <TrustSection stats={stats} certifications={certifications} locale={locale} />

      <ProcessSection steps={resolveProcessSteps(processCards)} locale={locale} />

      <section id="products" className="py-20 bg-zinc-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">
                {t.productsTitle}
              </h2>
              <p className="text-lg text-zinc-600">
                {t.productsDescription}
              </p>
            </div>
            <ArrowLink href={localePath(locale, "/products")} className="hidden md:inline-flex items-center text-brand font-medium hover:underline shrink-0">
              {t.allProducts}
            </ArrowLink>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {!showStatic ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400 relative">
                    <ProductCardImage
                      image={product.image}
                      name={product.name}
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xl font-semibold mb-2 text-zinc-900">
                      {product.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                        {product.type === "raw" ? t.raw : t.finished}
                      </span>
                      <span className="text-zinc-600 text-sm font-medium">
                        {t.stock} {product.stock} {product.unit}
                      </span>
                    </div>
                    {product.description && (
                      <p className="mt-3 text-zinc-500 text-sm line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <StaticProductCards />
            )}
          </div>

          <div className="mb-12">
            <ProductSpecTable rows={buildProductSpecRows(allProducts)} locale={locale} />
          </div>

          <div className="text-center md:hidden">
            <ArrowLink href={localePath(locale, "/products")} className="inline-flex items-center text-brand font-medium hover:underline">
              {t.allProducts}
            </ArrowLink>
          </div>
        </div>
      </section>

      <HomeGallerySection albums={albums} locale={locale} />

      <HomeBlogSection posts={posts} locale={locale} />

      <HomeContactSection locale={locale} />

      <SiteFooter locale={locale} />
    </div>
  );
}
