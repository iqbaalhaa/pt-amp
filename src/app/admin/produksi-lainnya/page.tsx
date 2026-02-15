import { Metadata } from "next";
import OtherProductionClient from "@/components/admin/production/OtherProductionClient";

export const metadata: Metadata = {
  title: "Produksi Lainnya | Admin",
  description: "Halaman input produksi lainnya",
};

export default function ProduksiLainnyaPage() {
  return <OtherProductionClient />;
}
