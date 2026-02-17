"use client";

import { Box, Typography, Stack, Tooltip, IconButton } from "@mui/material";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import { InventoryItemDTO } from "@/actions/inventory-actions";
import CategoryIcon from "@mui/icons-material/Category";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatRupiah } from "@/lib/currency";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useRouter } from "next/navigation";

export default function InventoryClient({ initialData }: { initialData: InventoryItemDTO[] }) {
  const router = useRouter();

  const columns: Column<InventoryItemDTO>[] = [
    {
      header: "Jenis Barang",
      accessorKey: "itemTypeName",
      className: "w-[35%]", // Memberikan porsi lebar yang cukup
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgba(213,14,12,0.1)] to-[rgba(213,14,12,0.05)] flex items-center justify-center text-[var(--brand)] shadow-sm">
            <CategoryIcon fontSize="small" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-800 tracking-wide uppercase text-sm">
              {row.itemTypeName}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">
              ID: {row.itemTypeId}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Total Stok",
      accessorKey: "totalQty",
      className: "w-[20%] text-right",
      cell: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-zinc-900 text-base">
            {row.totalQty.toLocaleString("id-ID")}
          </span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase">
            Satuan
          </span>
          {row.packagingBungkus > 0 && (
            <span className="text-[10px] text-zinc-500 font-medium">
              Keterangan: {row.packagingBungkus.toLocaleString("id-ID")} ball dikemas
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Harga Rata-rata",
      accessorKey: "avgPrice",
      className: "w-[20%] text-right",
      cell: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-emerald-600 text-sm">
            {formatRupiah(row.avgPrice, 0)}
          </span>
          <Tooltip title="Rata-rata harga beli dari semua transaksi posted">
            <div className="flex items-center gap-1 cursor-help">
              <span className="text-[10px] text-zinc-400 font-medium">Avg. Cost</span>
              <InfoOutlinedIcon sx={{ fontSize: 10, color: '#A1A1AA' }} />
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      header: "Pembelian Terakhir",
      accessorKey: "lastPurchaseDate",
      className: "w-[20%] text-right",
      cell: (row) => (
        <div className="flex flex-col items-end">
          <span className="text-zinc-700 font-semibold text-xs">
            {row.lastPurchaseDate 
              ? format(new Date(row.lastPurchaseDate), "dd/MM/yyyy", { locale: id })
              : "-"
            }
          </span>
          <span className="text-[10px] text-zinc-400 font-medium italic">
            {row.lastPurchaseDate 
              ? format(new Date(row.lastPurchaseDate), "HH:mm", { locale: id }) + " WIB"
              : "No Transaction"
            }
          </span>
        </div>
      ),
    },
    {
      header: "",
      accessorKey: "itemTypeId",
      className: "w-[5%] text-center",
      cell: (row) => (
        <IconButton 
          size="small" 
          className="text-zinc-300 group-hover:text-[var(--brand)] transition-colors"
        >
          <ChevronRightIcon />
        </IconButton>
      ),
    },
  ];

  const totalInventoryValue = initialData.reduce((acc, curr) => acc + curr.totalExpense, 0);

  return (
    <Stack spacing={4}>
      <Box className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <Box className="flex flex-col gap-1">
          <Typography variant="h4" className="font-black text-zinc-800 tracking-tight">
            Inventaris Produk
          </Typography>
          <Typography variant="body2" className="text-zinc-500 font-medium">
            Rekapan stok & nilai aset berdasarkan pembelian yang telah dikonfirmasi.
          </Typography>
        </Box>

        <Box className="bg-white/50 backdrop-blur-md border border-white/80 p-4 rounded-2xl shadow-sm flex flex-col items-end">
          <Typography className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            Total Nilai Inventaris
          </Typography>
          <Typography className="text-2xl font-black text-zinc-900">
            {formatRupiah(totalInventoryValue, 0)}
          </Typography>
        </Box>
      </Box>

      <GlassTable 
        data={initialData} 
        columns={columns}
        className="shadow-2xl border border-white/40 overflow-hidden cursor-pointer"
        onRowClick={(row) => router.push(`/admin/inventory/products/${row.itemTypeId}`)}
      />
    </Stack>
  );
}
