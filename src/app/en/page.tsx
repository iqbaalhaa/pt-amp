import HomePage from "@/components/pages/home/HomePage";
import { pageMetadata } from "@/lib/seo";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";

export const metadata = pageMetadata(
  "Indonesian Cinnamon (Cassia Vera) Exporter from West Sumatra",
  "PT AMP processes and exports Indonesian cinnamon (Cinnamomum burmannii / Cassia Vera) from West Sumatra: grade A, grade B and broken, hygienically processed for export markets.",
  "/",
  "en"
);

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <OrganizationJsonLd />
      <HomePage locale="en" />
    </>
  );
}
