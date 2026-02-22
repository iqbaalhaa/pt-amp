"use client";

import { Box, Typography, Stack, IconButton, Button } from "@mui/material";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import { InventoryHistoryDTO } from "@/actions/inventory-actions";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatRupiah } from "@/lib/currency";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useRouter } from "next/navigation";

export default function InventoryHistoryClient({ 
  data, 
  itemTypeName 
}: { 
  data: InventoryHistoryDTO[], 
  itemTypeName: string 
}) {
  const router = useRouter();

  const columns: Column<InventoryHistoryDTO>[] = [
    {
      header: "Tanggal",
      accessorKey: "date",
      className: "w-[20%]",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-zinc-800 text-sm">
            {format(new Date(row.date), "dd MMMM yyyy", { locale: id })}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium italic">
            {format(new Date(row.date), "HH:mm", { locale: id })} WIB
          </span>
        </div>
      ),
    },
    {
      header: "Supplier / Sumber",
      accessorKey: "supplier",
      className: "w-[30%]",
      cell: (row) => (
        <span className="font-bold text-zinc-700 tracking-wide uppercase text-sm">
          {row.supplier || "Tanpa Supplier"}
        </span>
      ),
    },
    {
      header: "Kuantitas",
      accessorKey: "qty",
      className: "w-[15%] text-right",
      cell: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-zinc-900 text-base">
            {row.qty.toLocaleString("id-ID")}
          </span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase">{row.unit || "Unit"}</span>
        </div>
      ),
    },
    {
      header: "Harga Satuan",
      accessorKey: "unitCost",
      className: "w-[15%] text-right",
      cell: (row) => (
        <span className="font-semibold text-emerald-600 text-sm">
          {formatRupiah(row.unitCost, 0)}
        </span>
      ),
    },
    {
      header: "Total",
      accessorKey: "total",
      className: "w-[20%] text-right",
      cell: (row) => (
        <span className="font-black text-zinc-800 text-sm">
          {formatRupiah(row.total, 0)}
        </span>
      ),
    },
  ];

  return (
    <Stack spacing={4}>
      <Box className="flex items-center gap-4">
        <IconButton 
          onClick={() => router.back()}
          className="bg-white/50 hover:bg-white shadow-sm border border-zinc-100"
        >
          <ArrowBackIcon />
        </IconButton>
        <Box className="flex flex-col gap-0.5">
          <Typography variant="h4" className="font-black text-zinc-800 tracking-tight flex items-center gap-2">
            Riwayat Pembelian: <span className="text-[var(--brand)] uppercase">{itemTypeName}</span>
          </Typography>
          <Typography variant="body2" className="text-zinc-500 font-medium">
            Detail transaksi masuk untuk jenis barang ini.
          </Typography>
        </Box>
      </Box>

      <GlassTable 
        data={data} 
        columns={columns}
        className="shadow-2xl border border-white/40 overflow-hidden cursor-pointer"
        onRowClick={(row) => {
          // Opsional: Navigasi ke detail transaksi jika ada halamannya
          // router.push(`/admin/purchases/${row.purchaseId}`);
        }}
      />
    </Stack>
  );
}