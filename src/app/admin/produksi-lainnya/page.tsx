import { Metadata } from "next";
import ProduksiLainnyaPageClient from "./ProduksiLainnyaPageClient";

export const metadata: Metadata = {
  title: "Produksi Lainnya | Admin",
  description: "Halaman input produksi lainnya",
};

export default function ProduksiLainnyaPage() {
  return <ProduksiLainnyaPageClient />;
}
