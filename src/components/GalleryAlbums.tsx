"use client";

import { useState, useEffect } from "react";
import { X, Play, Image as ImageIcon, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

type MediaType = "image" | "video";

interface MediaItem {
  type: MediaType;
  src: string;
  thumbnail?: string;
  caption?: string;
}

interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  items: MediaItem[];
}

// Mock Data
const albums: Album[] = [
  {
    id: "process",
    title: "Proses Produksi",
    description: "Tahapan pengolahan kulit manis dari bahan mentah hingga siap ekspor.",
    coverImage: "https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?q=80&w=2070&auto=format&fit=crop",
    items: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?q=80&w=2070&auto=format&fit=crop",
        caption: "Pengeringan Kulit Manis"
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1599940778173-e276d4acb2e7?q=80&w=2070&auto=format&fit=crop",
        caption: "Sortir Kualitas"
      },
      {
        type: "video",
        src: "https://videos.pexels.com/video-files/4440816/4440816-hd_1920_1080_30fps.mp4",
        caption: "Proses Pembersihan Manual"
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1627568349272-3531b23c2806?q=80&w=2070&auto=format&fit=crop",
        caption: "Detail Tekstur"
      },
      {
         type: "image",
         src: "https://images.unsplash.com/photo-1588612760636-f0331073867c?q=80&w=2070&auto=format&fit=crop",
         caption: "Pemeriksaan Akhir"
       }
    ]
  },
  {
    id: "facility",
    title: "Fasilitas & Gudang",
    description: "Gudang penyimpanan standar internasional dan area kerja yang higienis.",
    coverImage: "https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop",
    items: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop",
        caption: "Gudang Utama"
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1615485925763-867862f80933?q=80&w=2074&auto=format&fit=crop",
        caption: "Area Packing"
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=2072&auto=format&fit=crop",
        caption: "Loading Dock"
      }
    ]
  },
  {
    id: "products",
    title: "Varian Produk",
    description: "Berbagai grade kulit manis yang kami sediakan.",
    coverImage: "https://images.unsplash.com/photo-1615485400323-952445c71b47?q=80&w=2074&auto=format&fit=crop",
    items: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1615485400323-952445c71b47?q=80&w=2074&auto=format&fit=crop",
        caption: "Grade A Export"
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5a?q=80&w=2000&auto=format&fit=crop",
        caption: "Broken & Powder"
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1599525433649-0d122245c388?q=80&w=2070&auto=format&fit=crop",
        caption: "Stick Cinnamon"
      }
    ]
  }
];

export function GalleryAlbums() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (selectedAlbum) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedAlbum]);

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setLightboxIndex(null);
  };

  const closeAlbum = () => {
    setSelectedAlbum(null);
    setLightboxIndex(null);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAlbum && lightboxIndex !== null) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      setLightboxIndex((prev) => (prev !== null && prev < selectedAlbum.items.length - 1 ? prev + 1 : 0));
    }
  };

  const prevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAlbum && lightboxIndex !== null) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : selectedAlbum.items.length - 1));
    }
  };

  return (
    <section className="py-24 bg-zinc-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-[var(--brand)] font-semibold tracking-wider text-sm uppercase mb-3 block">Dokumentasi</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900 tracking-tight">Galeri Aktivitas</h1>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Menelusuri jejak kualitas dari petani hingga pengiriman.
          </p>
        </div>

        {/* Album Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {albums.map((album, idx) => (
            <div 
              key={album.id}
              onClick={() => openAlbum(album)}
              className="group cursor-pointer perspective-1000"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative transform transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-1">
                {/* Stack Effect Layers */}
                <div className="absolute inset-0 bg-zinc-200 rounded-2xl transform translate-x-2 translate-y-2 -z-10 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 group-hover:rotate-2"></div>
                <div className="absolute inset-0 bg-zinc-300 rounded-2xl transform translate-x-1 translate-y-1 -z-20 transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5 group-hover:rotate-1"></div>
                
                {/* Main Card */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-zinc-100">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10 transition-opacity duration-300 group-hover:opacity-40"></div>
                    <img 
                      src={album.coverImage} 
                      alt={album.title}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                      <span className="text-xs font-bold text-zinc-800 flex items-center gap-1">
                        <ImageIcon size={12} />
                        {album.items.length}
                      </span>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                        {album.title}
                      </h3>
                      <p className="text-white/80 text-sm line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        {album.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Album Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeAlbum}
          />
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl relative flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden ring-1 ring-white/20">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{selectedAlbum.title}</h2>
                <p className="text-zinc-500 text-sm">{selectedAlbum.items.length} foto & video</p>
              </div>
              <button 
                onClick={closeAlbum}
                className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors text-zinc-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - Masonry-ish Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 custom-scrollbar">
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {selectedAlbum.items.map((item, index) => (
                  <div 
                    key={index}
                    onClick={() => openLightbox(index)}
                    className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative">
                      {item.type === 'video' ? (
                        <div className="relative aspect-video bg-zinc-900">
                           <video 
                            src={item.src} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            muted
                            loop
                            playsInline
                            onMouseOver={e => e.currentTarget.play()}
                            onMouseOut={e => e.currentTarget.pause()}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                <Play className="text-white fill-white" size={20} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={item.src} 
                          alt={item.caption || ""}
                          className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end p-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                          {item.caption && (
                             <p className="text-white text-xs font-medium drop-shadow-md">{item.caption}</p>
                          )}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
                           <Maximize2 className="text-white drop-shadow-lg" size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox (Full Screen View) */}
      {selectedAlbum && lightboxIndex !== null && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/50 hover:text-white p-2 z-50 transition-colors bg-white/10 hover:bg-white/20 rounded-full"
          >
            <X size={24} />
          </button>

          <button 
            onClick={prevLightbox}
            className="absolute left-6 text-white/50 hover:text-white p-3 z-50 hidden md:block transition-colors bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm"
          >
            <ChevronLeft size={32} />
          </button>

          <div className={`w-full h-full flex flex-col items-center justify-center p-4 md:p-12 transition-opacity duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {selectedAlbum.items[lightboxIndex].type === 'video' ? (
              <video 
                src={selectedAlbum.items[lightboxIndex].src} 
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl ring-1 ring-white/10"
              />
            ) : (
              <img 
                src={selectedAlbum.items[lightboxIndex].src} 
                alt={selectedAlbum.items[lightboxIndex].caption}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
              />
            )}
            
            {selectedAlbum.items[lightboxIndex].caption && (
              <div className="mt-6 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                <p className="text-white/90 text-lg font-medium text-center">
                  {selectedAlbum.items[lightboxIndex].caption}
                </p>
              </div>
            )}
            
            <div className="absolute bottom-8 text-white/30 text-xs font-mono tracking-widest">
              {lightboxIndex + 1} / {selectedAlbum.items.length}
            </div>
          </div>

          <button 
            onClick={nextLightbox}
            className="absolute right-6 text-white/50 hover:text-white p-3 z-50 hidden md:block transition-colors bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-sm"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </section>
  );
}
