import { getProducts } from "@/actions/product-actions";
import ProductClient from "./product-client";

export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductClient initialProducts={products} />;
}
