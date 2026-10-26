import HomePage from "@/components/pages/home/HomePage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  alternates: languageAlternates("/"),
};

export const dynamic = "force-dynamic";

// Wrapper: page components take a locale prop, Next page props must stay standard.
export default function Page() {
  return <HomePage />;
}
