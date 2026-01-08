"use client";

const galleryItems = [
  {
    src: "https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?q=80&w=2070&auto=format&fit=crop",
    alt: "Proses Pengeringan",
    category: "Proses"
  },
  {
    src: "https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop",
    alt: "Gudang Penyimpanan",
    category: "Fasilitas"
  },
  {
    src: "https://images.unsplash.com/photo-1599940778173-e276d4acb2e7?q=80&w=2070&auto=format&fit=crop",
    alt: "Sortir Kualitas",
    category: "Quality Control"
  },
  {
    src: "https://images.unsplash.com/photo-1615485925763-867862f80933?q=80&w=2074&auto=format&fit=crop",
    alt: "Pengemasan",
    category: "Packing"
  },
  {
    src: "https://images.unsplash.com/photo-1615485400323-952445c71b47?q=80&w=2074&auto=format&fit=crop",
    alt: "Hasil Panen",
    category: "Raw Material"
  },
  {
    src: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5a?q=80&w=2000&auto=format&fit=crop",
    alt: "Tim Produksi",
    category: "Team"
  }
];

import Link from "next/link";

export function Gallery({ limit }: { limit?: number }) {
  const displayedItems = limit ? galleryItems.slice(0, limit) : galleryItems;

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Gallery</h2>
            <p className="text-lg text-zinc-600">
              Dokumentasi aktivitas dan fasilitas produksi kami.
            </p>
          </div>
          {limit && (
            <Link 
              href="/gallery" 
              className="hidden md:inline-flex items-center text-brand font-medium hover:underline shrink-0"
              style={{ color: "var(--brand)" }}
            >
              Lihat Semua Galeri
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {displayedItems.map((item, idx) => (
            <div 
              key={idx} 
              className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 cursor-pointer"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center p-4">
                  <p className="font-semibold text-lg">{item.alt}</p>
                  <p className="text-sm text-white/80">{item.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {limit && (
          <div className="text-center md:hidden">
            <Link 
              href="/gallery" 
              className="inline-flex items-center text-brand font-medium hover:underline"
              style={{ color: "var(--brand)" }}
            >
              Lihat Semua Galeri
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
