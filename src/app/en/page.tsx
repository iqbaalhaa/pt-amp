import HomePage from "@/components/pages/home/HomePage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  title: "PT AMP | Indonesian Cinnamon (Cassia Vera) Supplier",
  description: "PT AMP processes and supplies Indonesian cinnamon (Cinnamomum burmannii) from West Sumatra for local and export markets.",
  alternates: languageAlternates("/"),
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <HomePage locale="en" />;
}
