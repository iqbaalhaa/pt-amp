import GalleryPage from "@/components/pages/gallery/GalleryPage";
import type { Album } from "@/components/GalleryAlbums";
import {
  getGalleryAlbums,
  createGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  createGalleryMedia,
  updateGalleryMedia,
  deleteGalleryMedia,
} from "@/actions/cms-actions";

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
                <p className="text-xs text-zinc-500">
                  Satu card mewakili satu album yang berisi banyak foto atau
                  video.
                </p>
              </div>

              <div className="space-y-4">
                {albums.map((album) => (
                  <details
                    key={album.id}
                    className="border border-zinc-200 rounded-lg"
                    open
                  >
                    <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between gap-2 bg-zinc-50 rounded-lg">
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                          Album
                        </span>
                        <span className="text-sm font-semibold text-zinc-900">
                          {album.title || "Tanpa judul"}
                        </span>
                        <span className="text-xs text-zinc-500 line-clamp-1">
                          {album.description}
                        </span>
                      </div>
                      <div className="text-right text-[11px] text-zinc-500">
                        <div>Urutan: {album.order}</div>
                        <div>{album.items.length} media</div>
                      </div>
                    </summary>

                    <div className="px-4 pb-4 pt-2 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="text-xs text-zinc-500 break-all">
                            Cover: {album.coverImage}
                          </div>
                        </div>
                        <form
                          action={async () => {
                            "use server";
                            await deleteGalleryAlbum(album.id);
                          }}
                        >
                          <button className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs hover:bg-red-50">
                            Hapus Album
                          </button>
                        </form>
                      </div>

                      <form
                        action={async (formData) => {
                          "use server";
                          await updateGalleryAlbum(album.id, formData);
                        }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs text-zinc-600">Judul</label>
                            <input
                              name="title"
                              defaultValue={album.title}
                              className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-zinc-600">Urutan</label>
                            <input
                              name="order"
                              type="number"
                              defaultValue={album.order ?? 0}
                              className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-600">
                            Deskripsi
                          </label>
                          <input
                            name="description"
                            defaultValue={album.description ?? ""}
                            className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-600">
                            Cover Image URL (atau kosongkan jika upload file)
                          </label>
                          <input
                            name="coverImage"
                            defaultValue={album.coverImage}
                            className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
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
                            Jika diisi, file akan di-upload dan menggantikan URL
                            cover di atas.
                          </p>
                        </div>
                        <div>
                          <button className="px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs">
                            Simpan Perubahan Album
                          </button>
                        </div>
                      </form>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                            Media di Album Ini
                          </h3>
                          <div className="text-xs text-zinc-500">
                            {album.items.length} item
                          </div>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-auto pr-1">
                          {album.items.map((item) => (
                            <div
                              key={item.id}
                              className="border border-zinc-200 rounded-md p-3 space-y-2 bg-zinc-50"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-xs text-zinc-500">
                                  {item.type.toUpperCase()} • Urutan{" "}
                                  {item.order}
                                </div>
                                <form
                                  action={async () => {
                                    "use server";
                                    await deleteGalleryMedia(item.id);
                                  }}
                                >
                                  <button className="px-2 py-1 rounded-md border border-red-200 text-red-600 text-[11px] hover:bg-red-50">
                                    Hapus Media
                                  </button>
                                </form>
                              </div>
                              {item.caption && (
                                <div className="text-[11px] text-zinc-500 line-clamp-1">
                                  {item.caption}
                                </div>
                              )}

                              <details className="mt-2 border-t border-zinc-200 pt-2">
                                <summary className="cursor-pointer select-none text-[11px] text-zinc-600 flex items-center justify-between">
                                  <span>Edit detail media</span>
                                  <span className="text-[10px] text-zinc-400">
                                    Klik untuk buka / tutup
                                  </span>
                                </summary>
                                <div className="mt-2">
                                  <form
                                    action={async (formData) => {
                                      "use server";
                                      await updateGalleryMedia(item.id, formData);
                                    }}
                                    className="space-y-3 text-xs"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[11px] text-zinc-600">
                                          Type
                                        </label>
                                        <select
                                          name="type"
                                          defaultValue={item.type}
                                          className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                        >
                                          <option value="image">image</option>
                                          <option value="video">video</option>
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[11px] text-zinc-600">
                                          Urutan
                                        </label>
                                        <input
                                          name="order"
                                          type="number"
                                          defaultValue={item.order ?? 0}
                                          className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[11px] text-zinc-600">
                                        Sumber (URL)
                                      </label>
                                      <input
                                        name="src"
                                        defaultValue={item.src}
                                        className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[11px] text-zinc-600">
                                          Caption
                                        </label>
                                        <input
                                          name="caption"
                                          defaultValue={item.caption ?? ""}
                                          className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[11px] text-zinc-600">
                                          Thumbnail URL (opsional)
                                        </label>
                                        <input
                                          name="thumbnail"
                                          defaultValue={item.thumbnail ?? ""}
                                          className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[11px] text-zinc-600">
                                        Ganti File
                                      </label>
                                      <input
                                        name="file"
                                        type="file"
                                        className="block w-full text-[11px] text-zinc-600"
                                      />
                                    </div>
                                    <div>
                                      <button className="px-3 py-1.5 rounded-md bg-zinc-900 text-white text-[11px]">
                                        Simpan Media
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </details>
                            </div>
                          ))}
                        </div>

                        <details className="border border-dashed border-zinc-300 rounded-md p-3 text-xs">
                          <summary className="cursor-pointer select-none text-[11px] text-zinc-600 flex items-center justify-between">
                            <span>Tambah media baru</span>
                            <span className="text-[10px] text-zinc-400">
                              Klik untuk isi detail
                            </span>
                          </summary>
                          <div className="mt-2 space-y-3">
                            <form
                              action={async (formData) => {
                                "use server";
                                await createGalleryMedia(formData);
                              }}
                              className="space-y-3"
                            >
                              <input
                                type="hidden"
                                name="albumId"
                                value={album.id}
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-zinc-600">
                                    Type
                                  </label>
                                  <select
                                    name="type"
                                    defaultValue="image"
                                    className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                  >
                                    <option value="image">image</option>
                                    <option value="video">video</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-zinc-600">
                                    Urutan
                                  </label>
                                  <input
                                    name="order"
                                    type="number"
                                    defaultValue={album.items.length}
                                    className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] text-zinc-600">
                                  Sumber (URL) atau kosongkan jika upload file
                                </label>
                                <input
                                  name="src"
                                  className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[11px] text-zinc-600">
                                    Caption
                                  </label>
                                  <input
                                    name="caption"
                                    className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] text-zinc-600">
                                    Thumbnail URL (opsional)
                                  </label>
                                  <input
                                    name="thumbnail"
                                    className="w-full px-2 py-1.5 border border-zinc-300 rounded-md"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] text-zinc-600">
                                  Upload File
                                </label>
                                <input
                                  name="file"
                                  type="file"
                                  className="block w-full text-[11px] text-zinc-600"
                                />
                              </div>
                              <div>
                                <button className="px-3 py-1.5 rounded-md bg-[var(--brand)] text-white text-[11px]">
                                  Tambah Media ke Album
                                </button>
                              </div>
                            </form>
                          </div>
                        </details>
                      </div>
                    </div>
                  </details>
                ))}

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
