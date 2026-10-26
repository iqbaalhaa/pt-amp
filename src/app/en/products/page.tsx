import ProductsPage from "@/components/pages/products/ProductsPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Export-Grade Cinnamon (Cassia Vera) Products",
  "PT AMP cinnamon catalog: Cassia Vera grade A, grade B and broken, hygienically processed for export markets.",
  "/products",
  "en"
);

export const dynamic = "force-dynamic";

export default function Page() {
  return <ProductsPage locale="en" />;
}
