import AboutPage from "@/components/pages/about/AboutPage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  title: "About Us | PT AMP",
  description: "Profil PT AMP - Pengolahan dan Supplier Kulit Manis Berkualitas.",
  alternates: languageAlternates("/about"),
};

export const dynamic = "force-dynamic";

// Wrapper: page components take a locale prop, Next page props must stay standard.
export default function Page() {
  return <AboutPage />;
}
