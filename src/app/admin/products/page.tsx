import { getProducts } from "@/actions/product-actions";
import ProductClient from "@/components/admin/ProductClient";

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductClient initialProducts={products} />;
}
