import AboutPage from "@/components/pages/about/AboutPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Tentang Kami — Pengolah Kayu Manis Sumatera Barat",
  "Profil PT AMP: pengolahan dan pemasok kayu manis (cinnamon / Cassia Vera) berkualitas ekspor dari Sumatera Barat.",
  "/about"
);

export const dynamic = "force-dynamic";

// Wrapper: page components take a locale prop, Next page props must stay standard.
export default function Page() {
  return <AboutPage />;
}
