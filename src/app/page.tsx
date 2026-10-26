import HomePage from "@/components/pages/home/HomePage";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";

// Title/description/OG: default dari layout (rootMetadata).
export const metadata = { alternates: { canonical: "/" } };

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <>
      <OrganizationJsonLd />
      <HomePage />
    </>
  );
}
