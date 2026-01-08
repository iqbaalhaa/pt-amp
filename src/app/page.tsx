import { Navbar } from "@/components/Navbar";
import { HeroCarousel, HeroSlide } from "@/components/HeroCarousel";
import { Gallery } from "@/components/Gallery";
import { ContactForm } from "@/components/ContactForm";
import { getProducts } from "@/actions/product-actions";
import { latestPosts } from "@/lib/blog";
import Link from "next/link";

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    type: "image",
    src: "https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop",
    title: "Company Profile",
    description: "Perusahaan kulit manis skala UMKM–menengah. Fokus pada pembelian bahan mentah, proses pembersihan dan preparasi, hingga penjualan produk berkualitas.",
    buttons: [
      { text: "Lihat Produk", href: "#products", primary: true },
      { text: "Lihat Blog", href: "/blog" }
    ]
  },
  {
    id: 2,
    type: "video",
    src: "https://videos.pexels.com/video-files/4440816/4440816-hd_1920_1080_30fps.mp4",
    title: "Proses Berkualitas",
    description: "Menggunakan metode pengolahan tradisional yang dipadukan dengan standar kebersihan modern untuk menghasilkan kulit manis terbaik.",
    buttons: [
      { text: "Pelajari Proses", href: "#about", primary: true }
    ]
  },
  {
    id: 3,
    type: "image",
    src: "https://images.unsplash.com/photo-1615485925763-867862f80933?q=80&w=2074&auto=format&fit=crop",
    title: "Pasar Global",
    description: "Siap memenuhi kebutuhan pasar lokal maupun ekspor dengan kapasitas produksi yang stabil dan kualitas terjaga.",
    buttons: [
      { text: "Hubungi Kami", href: "#contact", primary: true }
    ]
  }
];

export default async function Home() {
  const allProducts = await getProducts();
  const products = allProducts.slice(0, 3);
  const showStatic = products.length === 0;
  const posts = latestPosts(3);

  return (
    <div className="min-h-screen font-sans bg-zinc-50">
      <Navbar />

      <HeroCarousel slides={heroSlides} />

      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">About Us</h2>
            <p className="text-lg text-zinc-600 leading-relaxed mb-6">
              Kami membeli kulit manis dari petani, melakukan pembersihan, pengikisan, penjemuran,
              dan pengemasan dalam ball 40–60 kg. Dengan tim ±10 orang, kami menjaga kualitas
              untuk memenuhi kebutuhan pasar lokal dan ekspor.
            </p>
            <Link href="/about" className="inline-flex items-center text-brand font-medium hover:underline" style={{ color: "var(--brand)" }}>
               Selengkapnya Tentang Kami <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl border border-zinc-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-6 text-brand group-hover:bg-red-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand)]"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-zinc-900">Pengadaan</h3>
              <p className="text-zinc-600">Kemitraan dengan petani untuk bahan baku berkualitas.</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-6 text-brand group-hover:bg-red-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand)]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-zinc-900">Proses</h3>
              <p className="text-zinc-600">Pembersihan, pengikisan, penjemuran, dan pengemasan standar.</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-6 text-brand group-hover:bg-red-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand)]"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-zinc-900">Penjualan</h3>
              <p className="text-zinc-600">Distribusi produk siap jual dengan kontrol mutu.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="py-20 bg-zinc-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Product</h2>
              <p className="text-lg text-zinc-600">Produk kulit manis siap jual dalam berbagai grade.</p>
            </div>
            <Link href="/products" className="hidden md:inline-flex items-center text-brand font-medium hover:underline shrink-0" style={{ color: "var(--brand)" }}>
               Lihat Semua Produk <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
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
                        {product.grade || "Standard"}
                      </span>
                      <span className="text-zinc-600 text-sm font-medium">Stock: {product.stock} kg</span>
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

          <div className="text-center md:hidden">
            <Link href="/products" className="inline-flex items-center text-brand font-medium hover:underline" style={{ color: "var(--brand)" }}>
               Lihat Semua Produk <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <Gallery limit={3} />

      <section id="blog" className="py-20 bg-zinc-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Latest News</h2>
              <p className="text-lg text-zinc-600">Berita dan artikel terbaru seputar kulit manis.</p>
            </div>
            <Link href="/blog" className="hidden md:inline-flex items-center text-brand font-medium hover:underline shrink-0" style={{ color: "var(--brand)" }}>
               Lihat Semua Berita <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
             {posts.map((post) => (
               <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block h-full flex flex-col">
                  <div className="h-48 bg-zinc-100 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-400">
                        <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
                     </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                     <div className="text-sm text-zinc-500 mb-2">{post.date}</div>
                     <h3 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-brand transition-colors" style={{ color: "var(--brand)" }}>{post.title}</h3>
                     <p className="text-zinc-600 line-clamp-3 text-sm flex-grow">{post.summary}</p>
                     <div className="mt-4 text-brand font-medium text-sm flex items-center" style={{ color: "var(--brand)" }}>
                        Baca Selengkapnya <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                     </div>
                  </div>
               </Link>
             ))}
          </div>

           <div className="text-center md:hidden">
            <Link href="/blog" className="inline-flex items-center text-brand font-medium hover:underline" style={{ color: "var(--brand)" }}>
               Lihat Semua Berita <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-brand mb-4">
                Hubungi Kami
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-zinc-900">Mari Bekerja Sama</h2>
              <p className="text-lg text-zinc-600 mb-4 leading-relaxed">
                Apakah Anda petani yang ingin menjual hasil panen, atau pembeli yang mencari pasokan kulit manis berkualitas? 
                Kami siap menjadi partner terpercaya Anda.
              </p>
              <Link href="/contact" className="inline-flex items-center text-brand font-medium hover:underline mb-8" style={{ color: "var(--brand)" }}>
                 Lihat Informasi Kontak Lengkap <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-brand">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-1">Lokasi Gudang</h3>
                    <p className="text-zinc-600">Jl. Raya Padang - Solok, KM 20, Indarung, Padang, Sumatera Barat</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-brand">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-1">Telepon / WhatsApp</h3>
                    <p className="text-zinc-600">+62 812 3456 7890</p>
                    <p className="text-sm text-zinc-500 mt-1">Senin - Sabtu, 08:00 - 17:00 WIB</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-brand">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-1">Email</h3>
                    <p className="text-zinc-600">contact@ptamp.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ContactForm />
            </div>
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
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors cursor-pointer">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5 text-zinc-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors cursor-pointer">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5 text-zinc-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 014.15 2.06c.636-.247 1.363-.416 2.427-.465C7.673 2.013 8.027 2 10.315 2h2zm-5.69 4.34a6.57 6.57 0 00-1.126.27 3.28 3.28 0 00-1.2 1.196 6.57 6.57 0 00-.27 1.126c-.035.795-.04 1.033-.04 3.088 0 2.054.005 2.292.04 3.088.016.368.053.722.112 1.068a3.28 3.28 0 001.31 2.07c.307.195.632.348.97.455.727.228 1.503.238 2.233.03.335-.096.658-.25 1.126-.27 3.28-3.28 0 001.2-1.196c.196-.307.349-.632.455-.97.228-.727.238-1.503.03-2.233a6.57 6.57 0 00-.27-1.126 3.28 3.28 0 00-1.2-1.196 6.57 6.57 0 00-1.126-.27c-.795-.035-1.033-.04-3.088-.04-2.054 0-2.292.005-3.088.04z" clipRule="evenodd" /></svg>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-zinc-900">Links</h3>
              <ul className="space-y-3 text-zinc-600">
                <li><a href="#about" className="hover:text-brand transition-colors">About Us</a></li>
                <li><a href="/products" className="hover:text-brand transition-colors">Products</a></li>
                <li><a href="/blog" className="hover:text-brand transition-colors">Blog</a></li>
                <li><a href="/login" className="hover:text-brand transition-colors">Login</a></li>
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
          
          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-zinc-500 text-sm">
              &copy; {new Date().getFullYear()} PT AMP. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-zinc-900">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-900">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}