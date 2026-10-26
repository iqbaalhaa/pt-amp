import ProductsPage from "@/components/pages/products/ProductsPage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  title: "Products | PT AMP",
  description: "Export-grade cinnamon (Cassia Vera) product catalog from PT AMP.",
  alternates: languageAlternates("/products"),
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <ProductsPage locale="en" />;
}
