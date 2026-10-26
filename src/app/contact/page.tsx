import ContactPage from "@/components/pages/contact/ContactPage";
import { pageMetadata } from "@/lib/seo";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";

export const metadata = pageMetadata(
  "Kontak — Minta Penawaran Kayu Manis Ekspor",
  "Hubungi PT AMP untuk penawaran, sampel, dan pemesanan kayu manis (cinnamon / Cassia Vera) grade ekspor.",
  "/contact"
);

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <>
      <OrganizationJsonLd />
      <ContactPage />
    </>
  );
}
