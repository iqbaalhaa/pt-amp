"use client";

const defaultGalleryItems = [
	{
		src: "https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?q=80&w=2070&auto=format&fit=crop",
		alt: "Proses Pengeringan",
		category: "Proses",
	},
	{
		src: "https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop",
		alt: "Gudang Penyimpanan",
		category: "Fasilitas",
	},
	{
		src: "https://images.unsplash.com/photo-1599940778173-e276d4acb2e7?q=80&w=2070&auto=format&fit=crop",
		alt: "Sortir Kualitas",
		category: "Quality Control",
	},
	{
		src: "https://images.unsplash.com/photo-1615485925763-867862f80933?q=80&w=2074&auto=format&fit=crop",
		alt: "Pengemasan",
		category: "Packing",
	},
	{
		src: "https://images.unsplash.com/photo-1615485400323-952445c71b47?q=80&w=2074&auto=format&fit=crop",
		alt: "Hasil Panen",
		category: "Raw Material",
	},
	{
		src: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5a?q=80&w=2000&auto=format&fit=crop",
		alt: "Tim Produksi",
		category: "Team",
	},
];

import { Play, Maximize2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryItem {
	src: string;
	alt: string;
	category: string;
	type?: string;
}

interface GalleryProps {
	limit?: number;
	items?: GalleryItem[];
}

export function Gallery({ limit, items }: GalleryProps) {
	const sourceItems = items && items.length > 0 ? items : defaultGalleryItems;
	const displayedItems = limit ? sourceItems.slice(0, limit) : sourceItems;
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);

	const openLightbox = (index: number) => {
		setLightboxIndex(index);
	};

	const closeLightbox = () => {
		setLightboxIndex(null);
	};

	const nextLightbox = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (lightboxIndex !== null) {
			setIsAnimating(true);
			setTimeout(() => setIsAnimating(false), 300);
			setLightboxIndex((prev) =>
				prev !== null && prev < displayedItems.length - 1 ? prev + 1 : 0,
			);
		}
	};

	const prevLightbox = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (lightboxIndex !== null) {
			setIsAnimating(true);
			setTimeout(() => setIsAnimating(false), 300);
			setLightboxIndex((prev) =>
				prev !== null && prev > 0 ? prev - 1 : displayedItems.length - 1,
			);
		}
	};

	return (
		<section id="gallery" className="py-20 bg-white">
			<div className="container mx-auto px-4 md:px-6 lg:px-8">
				<div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
					<div className="max-w-2xl">
						<h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">
							Gallery
						</h2>
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
							<svg
								className="w-4 h-4 ml-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M17 8l4 4m0 0l-4 4m4-4H3"
								/>
							</svg>
						</Link>
					)}
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
					{displayedItems.map((item, idx) => (
						<div
							key={idx}
							onClick={() => openLightbox(idx)}
							className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 aspect-square"
						>
							<div className="relative w-full h-full">
								{item.type === "video" ? (
									<div className="relative w-full h-full bg-zinc-900">
										<video
											src={item.src}
											className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
											muted
											loop
											playsInline
											onMouseOver={(e) => e.currentTarget.play()}
											onMouseOut={(e) => e.currentTarget.pause()}
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
										alt={item.alt || ""}
										className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
									/>
								)}

								{/* Overlay */}
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end p-4">
									<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
										{item.alt && (
											<p className="text-white text-xs font-medium drop-shadow-md">
												{item.alt}
											</p>
										)}
										<p className="text-white/80 text-[10px] drop-shadow-md">
											{item.category}
										</p>
									</div>
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
										<Maximize2
											className="text-white drop-shadow-lg"
											size={24}
										/>
									</div>
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
							<svg
								className="w-4 h-4 ml-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M17 8l4 4m0 0l-4 4m4-4H3"
								/>
							</svg>
						</Link>
					</div>
				)}

				{/* Lightbox (Full Screen View) */}
				{lightboxIndex !== null && (
					<div
						className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200"
						onClick={closeLightbox}
					>
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

						<div
							className={`w-full h-full flex flex-col items-center justify-center p-4 md:p-12 transition-opacity duration-300 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
							onClick={(e) => e.stopPropagation()}
						>
							{displayedItems[lightboxIndex].type === "video" ? (
								<video
									src={displayedItems[lightboxIndex].src}
									controls
									autoPlay
									className="max-w-full max-h-[80vh] rounded-lg shadow-2xl ring-1 ring-white/10"
								/>
							) : (
								<img
									src={displayedItems[lightboxIndex].src}
									alt={displayedItems[lightboxIndex].alt ?? ""}
									className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
								/>
							)}

							{displayedItems[lightboxIndex].alt && (
								<div className="mt-6 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
									<p className="text-white/90 text-lg font-medium text-center">
										{displayedItems[lightboxIndex].alt}
									</p>
								</div>
							)}

							<div className="absolute bottom-8 text-white/30 text-xs font-mono tracking-widest">
								{lightboxIndex + 1} / {displayedItems.length}
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
			</div>
		</section>
	);
}
