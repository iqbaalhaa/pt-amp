import HomePage from "@/components/pages/home/HomePage";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { languageAlternates } from "@/lib/i18n";

// Title/description/OG: default dari layout (rootMetadata).
export const metadata = { alternates: languageAlternates("/") };

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <>
      <OrganizationJsonLd />
      <HomePage />
    </>
  );
}
