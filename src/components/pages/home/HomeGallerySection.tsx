import { GalleryAlbums, type Album } from "@/components/GalleryAlbums";
import { ArrowLink } from "@/components/ArrowLink";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

// Hidden when the CMS has no albums (like TrustSection): no empty white area.
export function HomeGallerySection({
  albums,
  locale = "id",
}: {
  albums: Album[];
  locale?: Locale;
}) {
  const t = getDictionary(locale).home;
  if (albums.length === 0) return null;

  return (
        <section id="gallery" className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">
                  {t.galleryTitle}
                </h2>
                <p className="text-lg text-zinc-600">
                  {t.galleryDescription}
                </p>
              </div>
              <ArrowLink href={localePath(locale, "/gallery")} className="hidden md:inline-flex items-center text-brand font-medium hover:underline shrink-0">
                {t.allGallery}
              </ArrowLink>
            </div>
          </div>

          <GalleryAlbums
            albums={albums}
            locale={locale}
            showTitle={false}
            className="bg-white"
          />

          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center md:hidden mt-8">
              <ArrowLink href={localePath(locale, "/gallery")} className="inline-flex items-center text-brand font-medium hover:underline">
                {t.allGallery}
              </ArrowLink>
            </div>
          </div>
        </section>
  );
}
