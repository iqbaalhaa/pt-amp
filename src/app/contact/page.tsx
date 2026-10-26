import ContactPage from "@/components/pages/contact/ContactPage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  title: "Contact Us | PT AMP",
  description: "Hubungi PT AMP untuk kerjasama, pemesanan, dan pertanyaan seputar kulit manis.",
  alternates: languageAlternates("/contact"),
};

export const dynamic = "force-dynamic";

// Wrapper: page components take a locale prop, Next page props must stay standard.
export default function Page() {
  return <ContactPage />;
}
