import { Navbar } from "@/components/Navbar";
import { getProducts } from "@/actions/product-actions";
import Link from "next/link";
import { ArrowRight, Check, Package } from "lucide-react";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      {/* Hero Header */}
      <section className="bg-zinc-900 text-white py-20 md:py-28 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="text-[var(--brand)] font-semibold tracking-wider text-sm uppercase mb-3 block">
              Katalog Produk
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Premium Cassia Vera
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
              Pilihan lengkap produk kulit manis dengan berbagai grade dan spesifikasi pemotongan. Diproses higienis untuk memenuhi standar ekspor.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {products.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm">
                <Package className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Katalog Kosong</h3>
                <p className="text-zinc-500">Belum ada produk yang ditambahkan ke katalog.</p>
             </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:border-[var(--brand)] hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                    <img 
                      src={product.image || "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=2027&auto=format&fit=crop"} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[var(--brand)] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-zinc-600 text-sm leading-relaxed mb-6 line-clamp-3">
                      {product.description}
                    </p>

                    <div className="mt-auto space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-dashed border-zinc-200">
                          <span className="text-zinc-500">Unit</span>
                          <span className="font-medium text-zinc-900">{product.unit}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-dashed border-zinc-200">
                          <span className="text-zinc-500">Stok</span>
                          <span className="font-medium text-zinc-900">{product.stock}</span>
                        </div>
                      </div>

                      <Link 
                        href={`/contact?product=${encodeURIComponent(product.name)}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-[var(--brand)] transition-colors"
                      >
                        Minta Penawaran
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Quality Assurance Badge */}
      <section className="py-20 bg-white border-t border-zinc-200">
         <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="bg-[var(--brand)]/5 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto border border-[var(--brand)]/10">
               <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">Jaminan Kualitas</h2>
               <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                  <div className="flex items-center gap-2 text-zinc-700 font-medium">
                     <div className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center text-white shrink-0">
                        <Check className="w-5 h-5" />
                     </div>
                     Bebas Jamur
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 font-medium">
                     <div className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center text-white shrink-0">
                        <Check className="w-5 h-5" />
                     </div>
                     Kadar Air &lt; 14%
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 font-medium">
                     <div className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center text-white shrink-0">
                        <Check className="w-5 h-5" />
                     </div>
                     Packing Aman
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 font-medium">
                     <div className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center text-white shrink-0">
                        <Check className="w-5 h-5" />
                     </div>
                     Warna Alami
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
