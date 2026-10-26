import ProductsPage from "@/components/pages/products/ProductsPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Produk Kayu Manis (Cinnamon / Cassia Vera) Grade Ekspor",
  "Katalog kayu manis PT AMP: cinnamon / Cassia Vera grade A, grade B dan broken, diproses higienis untuk pasar ekspor.",
  "/products"
);

export const dynamic = "force-dynamic";

// Wrapper: page components take a locale prop, Next page props must stay standard.
export default function Page() {
  return <ProductsPage />;
}
