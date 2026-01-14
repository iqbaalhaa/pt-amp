import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Invoice, type InvoiceData } from "@/components/Invoice";

type SearchParams = {
  type?: "purchase" | "sale";
  id?: string;
};

export default async function InvoicePrintPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  if (!params.type || !params.id) {
    notFound();
  }

  let data: InvoiceData | null = null;
  if (params.type === "purchase") {
    const p = await prisma.purchase.findUnique({
      where: { id: BigInt(params.id) },
      include: {
        purchaseItems: {
          include: { product: true },
        },
      },
    });
    if (!p) notFound();
    const items = p.purchaseItems.map((it) => {
      const qty = it.qty.toString();
      const price = it.unitCost.toString();
      return {
        productName: it.product.name,
        qty,
        unit: it.product.unit,
        price,
        total: (parseFloat(qty) * parseFloat(price)).toString(),
      };
    });
    const totalAmount = items
      .reduce((sum, it) => sum + parseFloat(it.total), 0)
      .toString();
    data = {
      id: p.id.toString(),
      date: p.date.toISOString(),
      partyName: p.supplier,
      partyType: "Supplier",
      type: "Purchase Invoice",
      notes: p.notes,
      items,
      totalAmount,
    };
  } else if (params.type === "sale") {
    const s = await prisma.sale.findUnique({
      where: { id: BigInt(params.id) },
      include: {
        saleItems: {
          include: { product: true },
        },
      },
    });
    if (!s) notFound();
    const items = s.saleItems.map((it) => {
      const qty = it.qty.toString();
      const price = it.unitPrice.toString();
      return {
        productName: it.product.name,
        qty,
        unit: it.product.unit,
        price,
        total: (parseFloat(qty) * parseFloat(price)).toString(),
      };
    });
    const totalAmount = items
      .reduce((sum, it) => sum + parseFloat(it.total), 0)
      .toString();
    data = {
      id: s.id.toString(),
      date: s.date.toISOString(),
      partyName: s.customer,
      partyType: "Customer",
      type: "Sales Invoice",
      notes: s.notes,
      items,
      totalAmount,
    };
  } else {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-[105mm] p-0 m-0">
      {data && <Invoice data={data} />}
    </main>
  );
}

