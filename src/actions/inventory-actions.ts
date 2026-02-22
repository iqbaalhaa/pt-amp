"use server";

import { prisma } from "@/lib/prisma";

export type InventoryItemDTO = {
  itemTypeId: string;
  itemTypeName: string;
  image: string | null;
  totalQty: number;
  totalExpense: number;
  avgPrice: number;
  lastPurchaseDate: string | null;
  packagingBungkus: number;
};

export async function getInventorySummary(): Promise<InventoryItemDTO[]> {
  // 1. Ambil semua ItemType yang aktif
  const itemTypes = await prisma.itemType.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  // 2. Ambil Stock Movements (Real Stock)
  const stockSummary = await prisma.stockMovement.groupBy({
    by: ["itemTypeId"],
    _sum: {
      qty: true,
    },
  });

  // 3. Ambil Purchase Info (untuk Avg Price & Last Purchase Date)
  const purchaseSummary = await prisma.purchaseItem.groupBy({
    by: ["itemTypeId"],
    _sum: {
      qty: true,
      unitCost: true,
    },
    where: {
      purchase: {
        status: "posted",
      },
    },
  });

  const pengemasanItems = await prisma.pengemasanItem.findMany();

  const packagingMap = new Map<string, number>();

  (pengemasanItems as any[]).forEach((item) => {
    const itemTypeIdValue = (item as any).itemTypeId;
    if (!itemTypeIdValue) return;
    const bungkus = Number((item as any).bungkus || 0);
    if (bungkus <= 0) return;
    const key = itemTypeIdValue.toString();
    packagingMap.set(key, (packagingMap.get(key) || 0) + bungkus);
  });

  const results: InventoryItemDTO[] = await Promise.all(
    itemTypes.map(async (itemType) => {
      const typeId = itemType.id;

      // Stock Real
      const stockItem = stockSummary.find((s) => s.itemTypeId === typeId);
      const totalQty = Number(stockItem?._sum.qty || 0);

      // Purchase Data (untuk Avg Price)
      // Kita perlu fetch detail untuk item ini jika ada pembelian posted
      const purchaseItems = await prisma.purchaseItem.findMany({
        where: {
          itemTypeId: typeId,
          purchase: { status: "posted" },
        },
        include: { purchase: true },
      });

      // Hitung Avg Price dari pembelian
      let totalPurchaseQty = 0;
      let totalPurchaseExpense = 0;
      let lastPurchaseDate: string | null = null;

      if (purchaseItems.length > 0) {
        totalPurchaseQty = purchaseItems.reduce(
          (acc, curr) => acc + Number(curr.qty),
          0
        );
        totalPurchaseExpense = purchaseItems.reduce(
          (acc, curr) => acc + Number(curr.qty) * Number(curr.unitCost),
          0
        );

        lastPurchaseDate = purchaseItems
          .reduce((latest, curr) => {
            return curr.purchase.date > latest ? curr.purchase.date : latest;
          }, purchaseItems[0].purchase.date)
          .toISOString();
      }

      const avgPrice =
        totalPurchaseQty > 0 ? totalPurchaseExpense / totalPurchaseQty : 0;

      const totalExpense = totalQty * avgPrice;

      return {
        itemTypeId: typeId.toString(),
        itemTypeName: itemType.name,
        image: itemType.image,
        totalQty,
        totalExpense,
        avgPrice,
        lastPurchaseDate,
        packagingBungkus: packagingMap.get(typeId.toString()) || 0,
      };
    })
  );

  return results
    .filter((r) => r.totalQty > 0)
    .sort((a, b) => a.itemTypeName.localeCompare(b.itemTypeName));
}

export async function getInventoryItemSummary(
  itemTypeId: string
): Promise<InventoryItemDTO | null> {
  // 1. Stock Real
  const stockSum = await prisma.stockMovement.aggregate({
    _sum: { qty: true },
    where: { itemTypeId: BigInt(itemTypeId) },
  });
  const totalQty = Number(stockSum._sum.qty || 0);

  // 2. Item Details
  const itemType = await prisma.itemType.findUnique({
    where: { id: BigInt(itemTypeId) },
  });

  if (!itemType) return null;

  // 3. Purchase Data (Avg Price)
  const purchaseItems = await prisma.purchaseItem.findMany({
    where: {
      itemTypeId: BigInt(itemTypeId),
      purchase: { status: "posted" },
    },
    include: { purchase: true },
  });

  let totalPurchaseQty = 0;
  let totalPurchaseExpense = 0;
  let lastPurchaseDate: string | null = null;

  if (purchaseItems.length > 0) {
    totalPurchaseQty = purchaseItems.reduce(
      (acc, curr) => acc + Number(curr.qty),
      0
    );
    totalPurchaseExpense = purchaseItems.reduce(
      (acc, curr) => acc + Number(curr.qty) * Number(curr.unitCost),
      0
    );

    lastPurchaseDate = purchaseItems
      .reduce((latest, curr) => {
        return curr.purchase.date > latest ? curr.purchase.date : latest;
      }, purchaseItems[0].purchase.date)
      .toISOString();
  }

  const avgPrice =
    totalPurchaseQty > 0 ? totalPurchaseExpense / totalPurchaseQty : 0;
  const totalExpense = totalQty * avgPrice;

  const pengemasanItems = await prisma.pengemasanItem.findMany();

  const packagingBungkus = (pengemasanItems as any[]).reduce((acc, item) => {
    const itemTypeIdValue = (item as any).itemTypeId;
    if (!itemTypeIdValue) return acc;
    if (itemTypeIdValue.toString() !== itemTypeId) return acc;
    return acc + Number((item as any).bungkus || 0);
  }, 0);

  return {
    itemTypeId: itemTypeId,
    itemTypeName: itemType.name,
    image: itemType.image,
    totalQty,
    totalExpense,
    avgPrice,
    lastPurchaseDate,
    packagingBungkus,
  };
}

export type StockMovementDTO = {
  id: string;
  date: string;
  type: string;
  reference: string;
  qty: number;
  sourceType: string;
  sourceId: string;
};

export type InventoryHistoryDTO = {
  id: string;
  purchaseId: string;
  date: string;
  supplier: string | null;
  qty: number;
  unitCost: number;
  total: number;
  unit: string | null;
  createdBy: string | null;
};

export async function getProductStockMovements(
  itemTypeId: string
): Promise<StockMovementDTO[]> {
  const movements = await prisma.stockMovement.findMany({
    where: { itemTypeId: BigInt(itemTypeId) },
    orderBy: { createdAt: "desc" },
  });

  // Collect source IDs
  const purchaseItemIds = movements
    .filter((m) => m.sourceType === "purchase_item")
    .map((m) => m.sourceId);

  const saleItemIds = movements
    .filter((m) => m.sourceType === "sale_item")
    .map((m) => m.sourceId);

  // Fetch sources
  const purchaseItems =
    purchaseItemIds.length > 0
      ? await prisma.purchaseItem.findMany({
          where: { id: { in: purchaseItemIds } },
          include: { purchase: true },
        })
      : [];

  const saleItems =
    saleItemIds.length > 0
      ? await prisma.saleItem.findMany({
          where: { id: { in: saleItemIds } },
          include: { sale: true },
        })
      : [];

  // Map movements to DTO
  return movements.map((m) => {
    let date = m.createdAt.toISOString();
    let type = "Unknown";
    let reference = "-";

    if (m.sourceType === "purchase_item") {
      const pItem = purchaseItems.find((p) => p.id === m.sourceId);
      if (pItem) {
        date = pItem.purchase.date.toISOString();
        type = "Pembelian";
        reference = `Purchase #${pItem.purchase.id}`;
      }
    } else if (m.sourceType === "sale_item") {
      const sItem = saleItems.find((s) => s.id === m.sourceId);
      if (sItem) {
        date = sItem.sale.date.toISOString();
        type = "Penjualan";
        reference = `Sale #${sItem.sale.id}`;
      }
    }

    return {
      id: m.id.toString(),
      date,
      type,
      reference,
      qty: Number(m.qty),
      sourceType: m.sourceType,
      sourceId: m.sourceId.toString(),
    };
  });
}

export async function getInventoryHistory(
  itemTypeId: string
): Promise<InventoryHistoryDTO[]> {
  const items = await prisma.purchaseItem.findMany({
    where: {
      itemTypeId: BigInt(itemTypeId),
      purchase: {
        status: "posted",
      },
    },
    include: {
      purchase: true,
      unit: true,
    },
    orderBy: {
      purchase: {
        date: "desc",
      },
    },
  });

  return items.map((i) => ({
    id: i.id.toString(),
    purchaseId: i.purchaseId.toString(),
    date: i.purchase.date.toISOString(),
    supplier: i.purchase.supplier,
    qty: Number(i.qty),
    unitCost: Number(i.unitCost),
    total: Number(i.qty) * Number(i.unitCost),
    unit: i.unit?.name || null,
    createdBy: null, // Sementara null karena belum ada relasi createdBy di model Purchase
  }));
}
