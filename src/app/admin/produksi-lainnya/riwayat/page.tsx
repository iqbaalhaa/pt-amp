import { Metadata } from "next";
import OtherProductionHistoryClient from "@/components/admin/production/OtherProductionHistoryClient";

export const metadata: Metadata = {
  title: "Riwayat Produksi Lainnya | Admin",
  description: "Riwayat input produksi lainnya",
};

export default function RiwayatProduksiLainnyaPage() {
  return <OtherProductionHistoryClient />;
}
