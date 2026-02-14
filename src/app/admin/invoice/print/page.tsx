import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Invoice, type InvoiceData } from "@/components/Invoice";

type SearchParams = {
  type?: "purchase" | "sale" | "expense";
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
          include: { itemType: true, unit: true },
        },
      },
    });
    if (!p) notFound();
    const items = p.purchaseItems.map((it) => {
      const qty = it.qty.toString();
      const price = it.unitCost.toString();
      return {
        productName: it.itemType.name,
        qty,
        unit: it.unit?.name || "Kg",
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
          include: { itemType: true },
        },
      },
    });
    if (!s) notFound();
    const items = s.saleItems.map((it) => {
      const qty = it.qty.toString();
      const price = it.unitPrice.toString();
      return {
        productName: it.itemType.name,
        qty,
        unit: "Kg", // SaleItem doesn't have unitId, default to Kg
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
  } else if (params.type === "expense") {
    const anyPrisma = prisma as any;
    let e:
      | { id: bigint; date: Date; notes: string | null; createdByName: string | null; items: Array<{ purpose: string; amount: any }> }
      | null = null;
    if (anyPrisma?.expense?.findUnique) {
      e = (await prisma.expense.findUnique({
        where: { id: BigInt(params.id) },
        include: { items: true },
      })) as any;
    } else {
      const header =
        await prisma.$queryRaw<Array<{ id: bigint; date: Date; notes: string | null; created_by_name: string | null }>>`
          SELECT e."id", e."date", e."notes", e."created_by_name"
          FROM "public"."expenses" e
          WHERE e."id" = ${BigInt(params.id)}
        `;
      if (header?.[0]) {
        const itemsRows =
          await prisma.$queryRaw<Array<{ purpose: string; amount: any }>>`
            SELECT "purpose", "amount" FROM "public"."expense_items"
            WHERE "expense_id" = ${BigInt(params.id)}
          `;
        e = {
          id: header[0].id,
          date: header[0].date,
          notes: header[0].notes,
          createdByName: header[0].created_by_name,
          items: itemsRows,
        };
      }
    }
    if (!e) notFound();
    const items = e.items.map((it) => {
      const price = it.amount.toString();
      return {
        productName: it.purpose,
        qty: "",
        unit: "",
        price,
        total: price,
      };
    });
    const totalAmount = items
      .reduce((sum, it) => sum + parseFloat(it.total), 0)
      .toString();
    data = {
      id: e.id.toString(),
      date: e.date.toISOString(),
      partyName: e.createdByName || "Expense",
      partyType: "Supplier",
      type: "Purchase Invoice",
      notes: e.notes,
      items,
      totalAmount,
    };
  } else {
    notFound();
  }

  return (
    <main className="mx-auto col-start-auto w-full max-w-[105mm] p-0 m-0">
      {data && <Invoice data={data} hideQty={params.type === "expense"} />}
    </main>
  );
}

