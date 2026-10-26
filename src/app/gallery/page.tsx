import GalleryPage from "@/components/pages/gallery/GalleryPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Galeri Produksi & Pengiriman Kayu Manis",
  "Dokumentasi produksi, gudang, dan pengiriman kayu manis (cinnamon) PT AMP.",
  "/gallery"
);

export const dynamic = "force-dynamic";

// Wrapper: page components take a locale prop, Next page props must stay standard.
export default function Page() {
  return <GalleryPage />;
}
