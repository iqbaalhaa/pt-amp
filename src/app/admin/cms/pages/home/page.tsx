import HomePage from "@/components/pages/home/HomePage";
import {
  getHomePageData,
  updateHomePage,
  getFeatureCards,
  createFeatureCard,
  updateFeatureCard,
  deleteFeatureCard,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  createHeroButton,
  updateHeroButton,
  deleteHeroButton,
} from "@/actions/cms-actions";

export const dynamic = "force-dynamic";

export default async function AdminCmsHomePage() {
  const [home, homeCards, heroSlides] = await Promise.all([
    getHomePageData(),
    getFeatureCards("HOME_ABOUT"),
    getHeroSlides(),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Pengaturan Halaman Beranda</h1>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
          <p className="text-zinc-600 mb-4">Kelola konten beranda, hero slides, dan feature cards.</p>

          <div className="space-y-4">
            <details open className="border border-zinc-200 rounded-lg">
              <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between bg-zinc-50">
                <span className="text-sm font-semibold text-zinc-700">
                  Hero Carousel (Slider Atas)
                </span>
                <span className="text-xs text-zinc-500">
                  Klik untuk buka / tutup pengaturan
                </span>
              </summary>
              <div className="px-4 pb-4 pt-2 space-y-3">
                <p className="text-xs text-zinc-500">
                  Atur gambar, judul, dan tombol di bagian paling atas halaman utama.
                </p>
                <div className="space-y-4">
                  {heroSlides.map((slide, index) => (
                    <details
                      key={slide.id}
                      className="border border-zinc-200 rounded-lg bg-zinc-50"
                    >
                      <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-zinc-700">
                            Slide {index + 1} – {slide.title || "Tanpa judul"}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Urutan tampil: {slide.order}
                          </div>
                        </div>
                        <button
                          type="submit"
                          form={`delete-slide-${slide.id}`}
                          className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs hover:bg-red-50"
                        >
                          Hapus slide ini
                        </button>
                      </summary>

                      <div className="px-4 pb-4 pt-2 space-y-3">
                        <form
                          id={`delete-slide-${slide.id}`}
                          action={async () => {
                            "use server";
                            await deleteHeroSlide(slide.id);
                          }}
                        />
                        <form
                          action={async (formData) => {
                            "use server";
                            await updateHeroSlide(slide.id, formData);
                          }}
                          className="space-y-3"
                        >
                          <div className="grid md:grid-cols-[180px_1fr] items-start gap-2">
                            <label className="text-xs font-medium text-zinc-700">Judul slide</label>
                            <div>
                              <input
                                name="title"
                                defaultValue={slide.title}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                                placeholder="Contoh: Company Profile PT AMP"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-[180px_1fr] items-start gap-2">
                            <label className="text-xs font-medium text-zinc-700">Deskripsi singkat</label>
                            <div>
                              <textarea
                                name="description"
                                defaultValue={slide.description}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm min-h-[70px]"
                                placeholder="Tulis penjelasan singkat tentang perusahaan / proses / keunggulan."
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                            <label className="text-xs font-medium text-zinc-700">Jenis konten</label>
                            <div>
                              <select
                                name="type"
                                defaultValue={slide.type}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                              >
                                <option value="image">Gambar</option>
                                <option value="video">Video</option>
                              </select>
                              <div className="text-[11px] text-zinc-500">
                                Pilih Gambar untuk foto, Video untuk file video.
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                            <label className="text-xs font-medium text-zinc-700">Urutan tampil</label>
                            <div>
                              <input
                                name="order"
                                type="number"
                                defaultValue={slide.order}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                                placeholder="1"
                              />
                              <div className="text-[11px] text-zinc-500">
                                Angka 1 tampil paling pertama, 2 setelahnya, dan seterusnya.
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                            <label className="text-xs font-medium text-zinc-700">
                              Link gambar / video
                            </label>
                            <div>
                              <input
                                name="src"
                                defaultValue={slide.src}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                                placeholder="Tempel link dari Unsplash, Pexels, dll."
                              />
                              <div className="text-[11px] text-zinc-500">
                                Pastikan link bisa diakses publik.
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                            <label className="text-xs font-medium text-zinc-700">
                              Upload media (opsional)
                            </label>
                            <div>
                              <input
                                type="file"
                                name="file"
                                accept="image/*,video/*"
                                className="block w-full text-xs file:mr-3 file:px-3 file:py-1.5 file:border file:border-zinc-300 file:rounded-md file:text-xs file:bg-white file:text-zinc-700 hover:file:bg-zinc-50"
                              />
                              <div className="text-[11px] text-zinc-500">
                                Jika diisi, file lokal akan digunakan dan link diabaikan. Otomatis mendeteksi Gambar/Video.
                              </div>
                            </div>
                          </div>

                          <div className="pt-1">
                            <button className="px-4 py-2 rounded-md bg-zinc-900 text-white text-xs">
                              Simpan perubahan slide
                            </button>
                          </div>
                        </form>

                        <div className="border-t border-zinc-200 pt-3 space-y-2">
                          <div className="text-xs font-semibold text-zinc-700">
                            Tombol di slide ini
                          </div>

                          {slide.buttons?.map((btn) => (
                            <div
                              key={btn.id}
                              className="flex flex-col md:flex-row md:items-end gap-2 md:gap-3 bg-white border border-zinc-200 rounded-md p-3"
                            >
                              <form
                                action={async (formData) => {
                                  "use server";
                                  await updateHeroButton(btn.id, formData);
                                }}
                                className="flex-1 space-y-2"
                              >
                                <div className="space-y-2">
                                  <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                                    <label className="text-[11px] font-medium text-zinc-700">
                                      Teks tombol
                                    </label>
                                    <div>
                                      <input
                                        name="text"
                                        defaultValue={btn.text}
                                        className="w-full px-3 py-1.5 border border-zinc-300 rounded-md text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                                    <label className="text-[11px] font-medium text-zinc-700">
                                      Link tujuan
                                    </label>
                                    <div>
                                      <input
                                        name="href"
                                        defaultValue={btn.href}
                                        className="w-full px-3 py-1.5 border border-zinc-300 rounded-md text-xs"
                                        placeholder="/contact atau /products"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                  <select
                                    name="isPrimary"
                                    defaultValue={btn.isPrimary ? "true" : "false"}
                                    className="px-3 py-1.5 border border-zinc-300 rounded-md text-xs"
                                  >
                                    <option value="true">Tombol utama (warna mencolok)</option>
                                    <option value="false">Tombol biasa</option>
                                  </select>
                                  <button className="px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs">
                                    Simpan tombol
                                  </button>
                                </div>
                              </form>

                              <form
                                action={async () => {
                                  "use server";
                                  await deleteHeroButton(btn.id);
                                }}
                              >
                                <button className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs hover:bg-red-50">
                                  Hapus
                                </button>
                              </form>
                            </div>
                          ))}

                          <form
                            action={async (formData) => {
                              "use server";
                              await createHeroButton(slide.id, formData);
                            }}
                            className="bg-white border border-dashed border-zinc-300 rounded-md p-3 space-y-2"
                          >
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-zinc-700">
                                  Teks tombol baru
                                </label>
                                <input
                                  name="text"
                                  className="w-full px-3 py-1.5 border border-zinc-300 rounded-md text-xs"
                                  placeholder="Contoh: Hubungi Kami"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-zinc-700">
                                  Link tujuan
                                </label>
                                <input
                                  name="href"
                                  className="w-full px-3 py-1.5 border border-zinc-300 rounded-md text-xs"
                                  placeholder="/contact"
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <select
                                name="isPrimary"
                                className="px-3 py-1.5 border border-zinc-300 rounded-md text-xs"
                              >
                                <option value="true">Tombol utama (warna mencolok)</option>
                                <option value="false">Tombol biasa</option>
                              </select>
                              <button className="px-3 py-1.5 rounded-md bg-[var(--brand)] text-white text-xs">
                                Tambah tombol
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </details>
                  ))}

                  <div className="border border-dashed border-zinc-300 rounded-lg p-4 bg-zinc-50">
                    <p className="text-xs font-medium text-zinc-700 mb-2">
                      Tambah slide baru
                    </p>
                    <form
                      action={async (formData) => {
                        "use server";
                        await createHeroSlide(formData);
                      }}
                      className="space-y-3"
                    >
                      <div className="grid md:grid-cols-[180px_1fr] items-start gap-2">
                        <label className="text-xs font-medium text-zinc-700">Judul slide</label>
                        <div>
                          <input
                            name="title"
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                            placeholder="Judul utama di slider"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-[180px_1fr] items-start gap-2">
                        <label className="text-xs font-medium text-zinc-700">Deskripsi singkat</label>
                        <div>
                          <textarea
                            name="description"
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm min-h-[70px]"
                            placeholder="Tulis penjelasan singkat."
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                        <label className="text-xs font-medium text-zinc-700">Jenis konten</label>
                        <div>
                          <select
                            name="type"
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                          >
                            <option value="image">Gambar</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                        <label className="text-xs font-medium text-zinc-700">Urutan tampil</label>
                        <div>
                          <input
                            name="order"
                            type="number"
                            defaultValue={0}
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                          />
                          <div className="text-[11px] text-zinc-500">
                            Biarkan 0 untuk otomatis, atau isi angka untuk posisi.
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                        <label className="text-xs font-medium text-zinc-700">Link gambar / video</label>
                        <div>
                          <input
                            name="src"
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                            placeholder="Tempel link gambar atau video"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-[180px_1fr] items-center gap-2">
                        <label className="text-xs font-medium text-zinc-700">Upload gambar (opsional)</label>
                        <div>
                          <input
                            type="file"
                            name="file"
                            accept="image/*"
                            className="block w-full text-xs file:mr-3 file:px-3 file:py-1.5 file:border file:border-zinc-300 file:rounded-md file:text-xs file:bg-white file:text-zinc-700 hover:file:bg-zinc-50"
                          />
                        </div>
                      </div>
                      <div className="pt-1">
                        <button className="px-4 py-2 rounded-md bg-[var(--brand)] text-white text-sm">
                          Tambah slide baru
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <form
            action={async (formData) => {
              "use server";
              await updateHomePage(formData);
            }}
            className="space-y-4"
          >
            {home?.id && <input type="hidden" name="id" defaultValue={home.id} />}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Judul About</label>
              <input
                type="text"
                name="aboutTitle"
                defaultValue={home?.aboutTitle || ""}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                placeholder="About Us"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Deskripsi About</label>
              <textarea
                name="aboutDescription"
                defaultValue={home?.aboutDescription || ""}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent min-h-[120px]"
                placeholder="Deskripsi singkat About di beranda"
                required
              />
            </div>
            <div className="pt-2">
              <button className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-sm">
                Simpan Perubahan
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">HOME_ABOUT Feature Cards</h2>
            <div className="space-y-3">
              {homeCards.map(card => (
                <div key={card.id} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-900">{card.title}</div>
                    <div className="text-sm text-zinc-600">{card.description}</div>
                    <div className="text-xs text-zinc-500">Icon: {card.icon || "-"}, Order: {card.order}</div>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await deleteFeatureCard(card.id);
                    }}
                  >
                    <button className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs hover:bg-red-50">
                      Hapus
                    </button>
                  </form>
                  <form
                    action={async (formData) => {
                      "use server";
                      await updateFeatureCard(card.id, formData);
                    }}
                    className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2"
                  >
                    <input name="title" defaultValue={card.title} className="px-2 py-1.5 border border-zinc-300 rounded-md" />
                    <input name="description" defaultValue={card.description ?? ""} className="md:col-span-2 px-2 py-1.5 border border-zinc-300 rounded-md" />
                    <input name="icon" defaultValue={card.icon ?? ""} className="px-2 py-1.5 border border-zinc-300 rounded-md" />
                    <input name="order" type="number" defaultValue={card.order} className="px-2 py-1.5 border border-zinc-300 rounded-md" />
                    <div className="md:col-span-4">
                      <button className="px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs">
                        Simpan Perubahan Card
                      </button>
                    </div>
                  </form>
                </div>
              ))}
              <form
                action={async (formData) => {
                  "use server";
                  await createFeatureCard(formData);
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-zinc-200 rounded-lg"
              >
                <input type="hidden" name="section" value="HOME_ABOUT" />
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">Judul</label>
                  <input name="title" className="w-full px-3 py-2 border border-zinc-300 rounded-lg" required />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-zinc-600">Deskripsi</label>
                  <textarea name="description" className="w-full px-3 py-2 border border-zinc-300 rounded-lg min-h-[80px]" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">Icon (lucide name)</label>
                  <input name="icon" className="w-full px-3 py-2 border border-zinc-300 rounded-lg" placeholder="Users / Factory / Globe2" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600">Order</label>
                  <input name="order" type="number" className="w-full px-3 py-2 border border-zinc-300 rounded-lg" defaultValue={0} />
                </div>
                <div className="md:col-span-2">
                  <button className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-sm">Tambah Card</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-700">Preview</h2>
          </div>
          <div className="max-h-[80vh] overflow-auto">
            <HomePage />
          </div>
        </div>
      </div>
    </div>
  );
}
