import ProductsPage from "@/components/pages/products/ProductsPage";
import { languageAlternates } from "@/lib/i18n";

export const metadata = {
  title: "Products | PT AMP",
  description: "Katalog produk kulit manis (Cassia Vera) grade ekspor dari PT AMP.",
  alternates: languageAlternates("/products"),
};

export const dynamic = "force-dynamic";

// Wrapper: page components take a locale prop, Next page props must stay standard.
export default function Page() {
  return <ProductsPage />;
}
