import AboutPage from "@/components/pages/about/AboutPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "About Us — Cinnamon Processor in West Sumatra",
  "Profile of PT AMP: processor and supplier of export-quality Indonesian cinnamon (Cassia Vera) from West Sumatra.",
  "/about",
  "en"
);

export const dynamic = "force-dynamic";

export default function Page() {
  return <AboutPage locale="en" />;
}
