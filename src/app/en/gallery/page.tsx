import GalleryPage from "@/components/pages/gallery/GalleryPage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  title: "Gallery | PT AMP",
  description: "Photos of PT AMP production, warehouse and shipping activities.",
  alternates: languageAlternates("/gallery"),
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <GalleryPage locale="en" />;
}
