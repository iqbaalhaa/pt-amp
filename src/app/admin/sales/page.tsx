import PembelianPage from "@/components/admin/sales/PembelianPage";
import { prisma } from "@/lib/prisma";

type ProductOption = {
  id: string;
  name: string;
  unit: string;
  type: "raw" | "finished";
};

export default async function AdminSalesPembelianPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true, type: true },
  });

  const productOptions: ProductOption[] = products.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    unit: p.unit,
    type: p.type,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <PembelianPage products={productOptions} />
    </main>
  );
}
