import AboutPage from "@/components/pages/about/AboutPage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  title: "About Us | PT AMP",
  description: "Profile of PT AMP - quality cinnamon processor and supplier from West Sumatra, Indonesia.",
  alternates: languageAlternates("/about"),
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <AboutPage locale="en" />;
}
