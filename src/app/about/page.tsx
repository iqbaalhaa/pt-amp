import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CheckCircle2, Users, Factory, Globe2 } from "lucide-react";

export const metadata = {
  title: "About Us | PT AMP",
  description: "Profil PT AMP - Pengolahan dan Supplier Kulit Manis Berkualitas.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      {/* Hero Header */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-[var(--brand)] font-semibold tracking-wider text-sm uppercase mb-3 block">
              Tentang Kami
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-zinc-900 tracking-tight">
              Dedikasi untuk Kualitas & Keaslian Kulit Manis
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed max-w-3xl">
              PT AMP berdiri dengan visi mengangkat potensi komoditas lokal ke pasar global. 
              Kami menjembatani petani kulit manis dengan industri melalui proses pengolahan yang terstandarisasi, 
              transparan, dan berkelanjutan.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Expanded from Homepage */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
             <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold mb-6 text-zinc-900">Siapa Kami?</h2>
                <p className="text-lg text-zinc-600 leading-relaxed mb-6">
                  Kami adalah perusahaan pengolahan kulit manis (Cinnamomum burmannii) skala menengah yang berlokasi di Sumatera Barat. 
                  Fokus utama kami adalah pembelian bahan mentah langsung dari petani, melakukan pembersihan, pengikisan, penjemuran, 
                  dan pengemasan profesional.
                </p>
                <p className="text-lg text-zinc-600 leading-relaxed mb-8">
                  Dengan dukungan tim ±10 tenaga kerja terampil, kami memproses bahan baku menjadi produk setengah jadi 
                  (Grade A, B, Broken) yang siap diekspor atau didistribusikan ke industri makanan dan farmasi lokal.
                </p>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[var(--brand)]" />
                    <span className="text-zinc-700 font-medium">Sumber langsung dari petani lokal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[var(--brand)]" />
                    <span className="text-zinc-700 font-medium">Proses sortasi dan grading ketat</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[var(--brand)]" />
                    <span className="text-zinc-700 font-medium">Kapasitas suplai stabil</span>
                  </div>
                </div>
             </div>
             <div className="order-1 md:order-2 bg-zinc-100 rounded-3xl overflow-hidden aspect-square relative">
                <img 
                   src="https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop" 
                   alt="Gudang Kulit Manis" 
                   className="w-full h-full object-cover"
                />
             </div>
          </div>

          {/* Core Values / Process Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-[var(--brand)]/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 text-[var(--brand)]">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900">Pengadaan & Kemitraan</h3>
              <p className="text-zinc-600 leading-relaxed">
                Kami membangun hubungan jangka panjang dengan petani. Transparansi penimbangan dan pembayaran yang adil adalah prioritas kami untuk menjaga keberlanjutan pasokan bahan baku.
              </p>
            </div>
            
            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-[var(--brand)]/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 text-[var(--brand)]">
                <Factory className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900">Proses & Kualitas</h3>
              <p className="text-zinc-600 leading-relaxed">
                Setiap batang kulit manis melalui tahap pembersihan, pengikisan kulit luar (scraping), dan penjemuran intensif untuk mencapai kadar air ideal sebelum dikemas.
              </p>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-100 hover:border-[var(--brand)]/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 text-[var(--brand)]">
                <Globe2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-zinc-900">Jangkauan Pasar</h3>
              <p className="text-zinc-600 leading-relaxed">
                Produk kami dikemas dalam ball press 40–60 kg yang efisien untuk pengiriman. Kami melayani kebutuhan industri bumbu, ekstrak, dan eksportir rempah.
              </p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Tertarik bekerja sama?</h3>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white rounded-full bg-[var(--brand)] hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Hubungi Kami
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
