import {
  getHomePageData,
  updateHomePage,
  getFeatureCards,
  createFeatureCard,
  updateFeatureCard,
  deleteFeatureCard,
  getHeroSlides,
} from "@/actions/cms-actions";
import HeroSlideCard from "@/components/admin/home/HeroSlideCard";
import CreateHeroSlideButton from "@/components/admin/home/CreateHeroSlideButton";

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
          <p className="text-zinc-600 mb-6">Kelola konten beranda, hero slides, dan feature cards.</p>

          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-zinc-800 border-b border-zinc-100 pb-2">
              Hero Carousel (Slider Atas)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroSlides.map((slide) => (
                <HeroSlideCard key={slide.id} slide={slide} />
              ))}
              <CreateHeroSlideButton nextOrder={heroSlides.length + 1} />
            </div>
          </div>

          <form
            action={async (formData) => {
              "use server";
              await updateHomePage(formData);
            }}
            className="space-y-4 pt-6 border-t border-zinc-100"
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

          <div className="mt-8 pt-6 border-t border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4">HOME_ABOUT Feature Cards</h2>
            <div className="space-y-3">
              {homeCards.map(card => (
                <div key={card.id} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg bg-zinc-50">
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
                    <input name="title" defaultValue={card.title} className="px-2 py-1.5 border border-zinc-300 rounded-md text-sm" />
                    <input name="description" defaultValue={card.description ?? ""} className="md:col-span-2 px-2 py-1.5 border border-zinc-300 rounded-md text-sm" />
                    <input name="icon" defaultValue={card.icon ?? ""} className="px-2 py-1.5 border border-zinc-300 rounded-md text-sm" placeholder="Icon" />
                    <input name="order" type="number" defaultValue={card.order} className="px-2 py-1.5 border border-zinc-300 rounded-md text-sm" placeholder="Order" />
                    <div className="md:col-span-4 flex justify-end">
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
                className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-dashed border-zinc-300 rounded-lg bg-zinc-50/50"
              >
                <input type="hidden" name="section" value="HOME_ABOUT" />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Judul</label>
                  <input name="title" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" required placeholder="Judul Fitur" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-zinc-700">Deskripsi</label>
                  <textarea name="description" className="w-full px-3 py-2 border border-zinc-300 rounded-lg min-h-[80px] text-sm" required placeholder="Deskripsi fitur..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Icon (lucide name)</label>
                  <input name="icon" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" placeholder="Users / Factory / Globe2" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Order</label>
                  <input name="order" type="number" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" defaultValue={homeCards.length + 1} />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-sm w-full md:w-auto">Tambah Feature Card</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
