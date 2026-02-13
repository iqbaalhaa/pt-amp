"use server";

import { prisma } from "@/lib/prisma";

export type InventoryItemDTO = {
  itemTypeId: string;
  itemTypeName: string;
  totalQty: number;
  totalExpense: number;
  avgPrice: number;
  lastPurchaseDate: string | null;
};

export async function getInventorySummary(): Promise<InventoryItemDTO[]> {
  // Ambil semua purchase items yang punya productId (ItemType)
  const summary = await prisma.purchaseItem.groupBy({
    by: ['itemTypeId'],
    _sum: {
      qty: true,
      unitCost: true,
    },
    where: {
      purchase: {
        status: 'posted',
      }
    }
  });

  // Ambil detail nama ItemType
  const itemTypes = await prisma.itemType.findMany({
    where: {
      id: {
        in: summary.map(s => BigInt(s.itemTypeId))
      }
    }
  });

  // Ambil detail untuk perhitungan yang lebih akurat (total expense per item type)
  const results: InventoryItemDTO[] = await Promise.all(
    summary.map(async (s) => {
      const itemType = itemTypes.find(t => t.id === BigInt(s.itemTypeId));
      
      // Hitung total expense secara manual dari semua item terkait
      const allItems = await prisma.purchaseItem.findMany({
        where: { 
          itemTypeId: BigInt(s.itemTypeId),
          purchase: { status: 'posted' }
        },
        include: { purchase: true }
      });

      const totalQty = Number(s._sum.qty || 0);
      const totalExpense = allItems.reduce((acc, curr) => {
        return acc + (Number(curr.qty) * Number(curr.unitCost));
      }, 0);

      const avgPrice = totalQty > 0 ? totalExpense / totalQty : 0;

      const lastPurchaseDate = allItems.length > 0 
        ? allItems.reduce((latest, curr) => {
            return curr.purchase.date > latest ? curr.purchase.date : latest;
          }, allItems[0].purchase.date).toISOString()
        : null;

      return {
        itemTypeId: s.itemTypeId.toString(),
        itemTypeName: itemType?.name || "Unknown",
        totalQty,
        totalExpense,
        avgPrice,
        lastPurchaseDate,
      };
    })
  );

  return results.sort((a, b) => a.itemTypeName.localeCompare(b.itemTypeName));
}

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

export async function getInventoryHistory(itemTypeId: string): Promise<InventoryHistoryDTO[]> {
  const items = await prisma.purchaseItem.findMany({
    where: {
      itemTypeId: BigInt(itemTypeId),
      purchase: {
        status: 'posted'
      }
    },
    include: {
      purchase: true,
      unit: true,
    },
    orderBy: {
      purchase: {
        date: 'desc'
      }
    }
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
