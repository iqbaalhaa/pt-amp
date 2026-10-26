import ContactPage from "@/components/pages/contact/ContactPage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  title: "Contact Us | PT AMP",
  description: "Contact PT AMP for partnerships, orders and cinnamon inquiries.",
  alternates: languageAlternates("/contact"),
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <ContactPage locale="en" />;
}
