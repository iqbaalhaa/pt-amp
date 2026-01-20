import GalleryPage from "@/components/pages/gallery/GalleryPage";
import type { Album } from "@/components/GalleryAlbums";
import {
  getGalleryAlbums,
  createGalleryAlbum,
} from "@/actions/cms-actions";
import GalleryAlbumCard from "@/components/admin/gallery/GalleryAlbumCard";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const albums = (await getGalleryAlbums()) as Album[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Pengaturan Gallery</h1>

      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <p className="text-zinc-600 mb-4">
              Kelola album dan konten gambar atau video yang tampil di halaman
              Gallery.
            </p>

            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-zinc-700">
                  Album Galeri
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <GalleryAlbumCard key={album.id} album={album} />
                ))}

                {/* Create New Album Card Placeholder - Optional or keep separate form */}
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-semibold text-zinc-700 mb-3">Buat Album Baru</h3>
                <form
                  action={async (formData) => {
                    "use server";
                    await createGalleryAlbum(formData);
                  }}
                  className="space-y-4 border border-dashed border-zinc-300 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-600">Judul Album</label>
                      <input
                        name="title"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-600">Order</label>
                      <input
                        name="order"
                        type="number"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg"
                        defaultValue={albums.length}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-600">
                      Deskripsi Album
                    </label>
                    <input
                      name="description"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-600">
                        Cover Image URL (atau kosongkan jika upload file)
                      </label>
                      <input
                        name="coverImage"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-600">
                        Upload Cover Image
                      </label>
                      <input
                        name="coverFile"
                        type="file"
                        accept="image/*"
                        className="block w-full text-xs text-zinc-600 file:mr-3 file:px-3 file:py-1.5 file:border file:border-zinc-300 file:rounded-md file:text-xs file:bg-white file:text-zinc-700 hover:file:bg-zinc-50"
                      />
                      <p className="text-[11px] text-zinc-500">
                        Jika diisi, file akan di-upload dan menggantikan URL cover
                        di kiri.
                      </p>
                    </div>
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-sm">
                      Tambah Album
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden h-fit">
          <div className="p-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-700">Preview</h2>
          </div>
          <div className="max-h-[80vh] overflow-auto">
            <GalleryPage />
          </div>
        </div>
      </div>
    </div>
  );
}
