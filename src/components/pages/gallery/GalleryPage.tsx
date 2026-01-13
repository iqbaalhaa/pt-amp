import { Navbar } from "@/components/Navbar";
import { getFeatureCards } from "@/actions/cms-actions";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Gallery } from "@/components/Gallery";

function getCategoryLabel(category: string) {
  switch (category) {
    case "WAREHOUSE": return "Fasilitas Gudang";
    case "PRODUCTION": return "Proses Produksi";
    case "SHIPPING": return "Pengiriman & Logistik";
    case "PRODUCTS": return "Showcase Produk";
    default: return category;
  }
}

export default async function GalleryPage() {
  const featureCards = await getFeatureCards("GALLERY_FEATURES");

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      {/* Hero Header */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <span className="text-[var(--brand)] font-semibold tracking-wider text-sm uppercase mb-3 block">
            Dokumentasi
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-zinc-900 tracking-tight">
            Galeri Aktivitas
          </h1>
          <p className="text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Intip langsung dapur produksi kami. Dari penerimaan bahan baku, sortasi manual, hingga proses packing siap ekspor.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <Gallery />
        </div>
      </section>

      <section className="py-20 bg-zinc-900 text-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {featureCards.length > 0 ? featureCards.map((card) => (
              <div key={card.id}>
                 <div className="flex justify-center mb-6 text-[var(--brand)]">
                    <DynamicIcon name={card.icon} className="w-12 h-12" />
                 </div>
                 <h3 className="text-4xl font-bold mb-2">{card.title}</h3>
                 <p className="text-zinc-400">{card.description}</p>
              </div>
            )) : (
              <>
                 <div>
                    <div className="text-4xl font-bold mb-2 text-[var(--brand)]">100+</div>
                    <p className="text-zinc-400">Mitra Petani</p>
                 </div>
                 <div>
                    <div className="text-4xl font-bold mb-2 text-[var(--brand)]">50 Ton</div>
                    <p className="text-zinc-400">Kapasitas Bulanan</p>
                 </div>
                 <div>
                    <div className="text-4xl font-bold mb-2 text-[var(--brand)]">Grade A</div>
                    <p className="text-zinc-400">Kualitas Ekspor</p>
                 </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
