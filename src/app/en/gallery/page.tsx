import GalleryPage from "@/components/pages/gallery/GalleryPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Cinnamon Production & Shipping Gallery",
  "Photos of PT AMP cinnamon production, warehouse and shipping.",
  "/gallery",
  "en"
);

export const dynamic = "force-dynamic";

export default function Page() {
  return <GalleryPage locale="en" />;
}
