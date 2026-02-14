"use client";

import { Box, Typography, Stack, IconButton, Chip } from "@mui/material";
import GlassTable, { Column } from "@/components/ui/GlassTable";
import { InventoryItemDTO, StockMovementDTO } from "@/actions/inventory-actions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Props = {
  summary: InventoryItemDTO;
  movements: StockMovementDTO[];
};

export default function ProductDetailClient({ summary, movements }: Props) {
  const router = useRouter();

  const columns: Column<StockMovementDTO>[] = [
    {
      header: "Tanggal",
      accessorKey: "date",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-800">
            {format(new Date(row.date), "dd MMM yyyy", { locale: id })}
          </span>
          <span className="text-xs text-zinc-500">
            {format(new Date(row.date), "HH:mm", { locale: id })} WIB
          </span>
        </div>
      ),
    },
    {
      header: "Tipe",
      accessorKey: "type",
      cell: (row) => {
        let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
        if (row.type === "Pembelian") color = "success";
        else if (row.type === "Penjualan") color = "warning";
        
        return (
          <Chip 
            label={row.type} 
            color={color} 
            size="small" 
            variant="outlined" 
            className="font-bold"
          />
        );
      },
    },
    {
      header: "Referensi",
      accessorKey: "reference",
      cell: (row) => (
        <span className="text-zinc-600 font-medium font-mono text-xs">
          {row.reference}
        </span>
      ),
    },
    {
      header: "Jumlah",
      accessorKey: "qty",
      className: "text-right",
      cell: (row) => (
        <span className={`font-bold ${row.qty > 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {row.qty > 0 ? "+" : ""}{row.qty.toLocaleString("id-ID")}
        </span>
      ),
    },
  ];

  return (
    <Stack spacing={4}>
      <Box className="flex items-center gap-4">
        <IconButton onClick={() => router.back()} className="bg-white/50 hover:bg-white/80">
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" className="font-black text-zinc-800 tracking-tight">
            {summary.itemTypeName}
          </Typography>
          <Typography variant="body2" className="text-zinc-500 font-medium">
            Detail pergerakan stok dan riwayat transaksi
          </Typography>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Box className="bg-white/50 backdrop-blur-md border border-white/80 p-6 rounded-2xl shadow-sm">
          <Typography className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">
            Total Stok Saat Ini
          </Typography>
          <Typography className="text-3xl font-black text-zinc-900">
            {summary.totalQty.toLocaleString("id-ID")} <span className="text-base font-normal text-zinc-500">Unit</span>
          </Typography>
        </Box>

        <Box className="bg-white/50 backdrop-blur-md border border-white/80 p-6 rounded-2xl shadow-sm">
          <Typography className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">
            Harga Rata-rata (Avg)
          </Typography>
          <Typography className="text-3xl font-black text-emerald-600">
            {formatRupiah(summary.avgPrice, 0)}
          </Typography>
        </Box>

        <Box className="bg-white/50 backdrop-blur-md border border-white/80 p-6 rounded-2xl shadow-sm">
          <Typography className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">
            Total Valuasi
          </Typography>
          <Typography className="text-3xl font-black text-zinc-900">
            {formatRupiah(summary.totalExpense, 0)}
          </Typography>
        </Box>
      </div>

      <Box>
        <Typography variant="h6" className="font-bold text-zinc-800 mb-4">
          Riwayat Pergerakan Stok
        </Typography>
        <GlassTable
          data={movements}
          columns={columns}
          className="shadow-xl"
        />
      </Box>
    </Stack>
  );
}
