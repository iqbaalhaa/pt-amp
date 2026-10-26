import ContactPage from "@/components/pages/contact/ContactPage";
import { pageMetadata } from "@/lib/seo";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";

export const metadata = pageMetadata(
  "Contact — Request a Cinnamon Export Quote",
  "Contact PT AMP for quotations, samples and orders of export-grade Indonesian cinnamon (Cassia Vera).",
  "/contact",
  "en"
);

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OrganizationJsonLd />
      <ContactPage locale="en" />
    </>
  );
}
