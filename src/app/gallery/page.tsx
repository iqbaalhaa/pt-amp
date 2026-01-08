import { Navbar } from "@/components/Navbar";
import { GalleryAlbums } from "@/components/GalleryAlbums";

export const metadata = {
  title: "Gallery | PT AMP",
  description: "Dokumentasi aktivitas, fasilitas, dan produk PT AMP.",
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen font-sans bg-zinc-50">
      <Navbar />
      <GalleryAlbums />
    </div>
  );
}
