import GalleryPage from "@/components/pages/gallery/GalleryPage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  title: "Gallery | PT AMP",
  description: "Dokumentasi kegiatan produksi, gudang, dan pengiriman PT AMP.",
  alternates: languageAlternates("/gallery"),
};

export const dynamic = "force-dynamic";

// Wrapper: page components take a locale prop, Next page props must stay standard.
export default function Page() {
  return <GalleryPage />;
}
