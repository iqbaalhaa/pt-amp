import { Navbar } from "@/components/Navbar";
import { getProducts } from "@/actions/product-actions";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await getProducts();
  const showStatic = products.length === 0;

  return (
    <div className="min-h-screen font-sans bg-zinc-50">
      <Navbar />

      <section className="py-20 bg-zinc-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Our Products</h1>
            <p className="text-lg text-zinc-600">Produk kulit manis siap jual dalam berbagai grade berkualitas ekspor.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {!showStatic ? (
              products.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400 relative">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-xl font-semibold mb-2 text-zinc-900">{product.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                        {product.type === "raw" ? "Raw" : "Finished"}
                      </span>
                      <span className="text-zinc-600 text-sm font-medium">
                        Stock: {product.stock} {product.unit}
                      </span>
                    </div>
                    {product.description && (
                      <p className="mt-3 text-zinc-500 text-sm line-clamp-2">{product.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1599940778173-e276d4acb2e7?q=80&w=2070&auto=format&fit=crop" 
                      alt="Cinnamon Grade A"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xl font-semibold mb-2 text-zinc-900">Cinnamon Grade A</div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                        Export Quality
                      </span>
                      <span className="text-zinc-600 text-sm font-medium">Ball 40–60 kg</span>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1615485400323-952445c71b47?q=80&w=2074&auto=format&fit=crop" 
                      alt="Cinnamon Grade B"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xl font-semibold mb-2 text-zinc-900">Cinnamon Grade B</div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                        Standard
                      </span>
                      <span className="text-zinc-600 text-sm font-medium">Ball 40–60 kg</span>
                    </div>
                  </div>
                </div>

                <div className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop" 
                      alt="Cinnamon Broken"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xl font-semibold mb-2 text-zinc-900">Cinnamon Broken</div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                        Industrial
                      </span>
                      <span className="text-zinc-600 text-sm font-medium">Sack 25 kg</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-zinc-200 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold mb-6" style={{ color: "var(--brand)" }}>PT AMP</div>
              <p className="text-zinc-600 max-w-md mb-6">
                Partner terpercaya untuk kebutuhan kulit manis berkualitas tinggi. Melayani pasar lokal dan internasional dengan standar mutu terbaik.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-zinc-900">Links</h3>
              <ul className="space-y-3 text-zinc-600">
                <li><Link href="/#about" className="hover:text-brand transition-colors">About Us</Link></li>
                <li><Link href="/products" className="hover:text-brand transition-colors">Products</Link></li>
                <li><Link href="/blog" className="hover:text-brand transition-colors">Blog</Link></li>
                <li><Link href="/login" className="hover:text-brand transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-zinc-900">Contact</h3>
              <ul className="space-y-3 text-zinc-600">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-zinc-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>Jl. Raya Padang - Solok, KM 20, Indarung, Padang, Sumatera Barat</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span>+62 812 3456 7890</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span>contact@ptamp.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-200 text-center text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} PT AMP. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
