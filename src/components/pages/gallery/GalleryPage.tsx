import { Navbar } from "@/components/Navbar";
import { getGalleryAlbums } from "@/actions/cms-actions";
import { GalleryAlbums } from "@/components/GalleryAlbums";
import { SiteFooter } from "@/components/SiteFooter";
import type { Locale } from "@/lib/i18n";

export default async function GalleryPage({
  locale = "id",
}: {
  locale?: Locale;
}) {
  const albums = await getGalleryAlbums();

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <GalleryAlbums albums={albums} locale={locale} />

      <SiteFooter locale={locale} />
    </div>
  );
}
