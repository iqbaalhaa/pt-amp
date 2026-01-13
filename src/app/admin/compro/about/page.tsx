import AboutPage from "@/components/pages/about/AboutPage";
import { getAboutPageData, updateAboutPage, createAboutPoint, deleteAboutPoint, getFeatureCards, createFeatureCard, deleteFeatureCard } from "@/actions/cms-actions";

export default async function AdminAboutPage() {
  const [about, valueCards] = await Promise.all([
    getAboutPageData(),
    getFeatureCards("ABOUT_VALUES"),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Pengaturan About Us</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
          <p className="text-zinc-600 mb-4">Kelola konten dan tampilan halaman About.</p>
          <form action={updateAboutPage} className="space-y-4">
            {about?.id && <input type="hidden" name="id" defaultValue={about.id} />}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Hero Title</label>
              <input
                type="text"
                name="heroTitle"
                defaultValue={about?.heroTitle || ""}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Hero Description</label>
              <textarea
                name="heroDescription"
                defaultValue={about?.heroDescription || ""}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Main Title</label>
              <input
                type="text"
                name="mainTitle"
                defaultValue={about?.mainTitle || ""}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Main Description</label>
              <textarea
                name="mainDescription"
                defaultValue={about?.mainDescription || ""}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent min-h-[120px]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Main Image URL</label>
              <input
                type="url"
                name="mainImage"
                defaultValue={about?.mainImage || ""}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                placeholder="https://..."
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
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">About Points</h2>
            <div className="space-y-3">
              {about?.points?.map(pt => (
                <div key={pt.id} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm text-zinc-900">{pt.text}</div>
                    <div className="text-xs text-zinc-500">Order: {pt.order}</div>
                  </div>
                  <form action={async () => { await deleteAboutPoint(pt.id); }}>
                    <button className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs hover:bg-red-50">
                      Hapus
                    </button>
                  </form>
                </div>
              ))}
              {about?.id && (
                <form action={createAboutPoint} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-zinc-200 rounded-lg">
                  <input type="hidden" name="aboutPageId" value={about.id} />
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs text-zinc-600">Teks Point</label>
                    <input name="text" className="w-full px-3 py-2 border border-zinc-300 rounded-lg" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-600">Order</label>
                    <input name="order" type="number" className="w-full px-3 py-2 border border-zinc-300 rounded-lg" defaultValue={0} />
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-sm">Tambah Point</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">ABOUT_VALUES Feature Cards</h2>
            <div className="space-y-3">
              {valueCards.map(card => (
                <div key={card.id} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-zinc-900">{card.title}</div>
                    <div className="text-sm text-zinc-600">{card.description}</div>
                    <div className="text-xs text-zinc-500">Icon: {card.icon || "-"}, Order: {card.order}</div>
                  </div>
                  <form action={async () => { await deleteFeatureCard(card.id); }}>
                    <button className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs hover:bg-red-50">
                      Hapus
                    </button>
                  </form>
                </div>
              ))}
              <form action={createFeatureCard} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-zinc-200 rounded-lg">
                <input type="hidden" name="section" value="ABOUT_VALUES" />
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
            <AboutPage />
          </div>
        </div>
      </div>
    </div>
  );
}
