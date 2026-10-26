import {
  getHomePageData,
  updateHomePage,
  getHeroSlides,
  getFeatureCards,
} from "@/actions/cms-actions";
import FeatureCardManager from "@/components/admin/home/FeatureCardManager";
import { HOME_ABOUT, HOME_CERTIFICATIONS, HOME_STATS } from "@/lib/cms-sections";
import HeroSlideCard from "@/components/admin/home/HeroSlideCard";
import CreateHeroSlideButton from "@/components/admin/home/CreateHeroSlideButton";
import ProcessStepsEditor from "@/components/admin/home/ProcessStepsEditor";
import { PROCESS_SECTION } from "@/lib/process-default";

export const dynamic = "force-dynamic";

export default async function AdminCmsHomePage() {
  const [home, heroSlides, processSteps] = await Promise.all([
    getHomePageData(),
    getHeroSlides(),
    getFeatureCards(PROCESS_SECTION),
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

          <FeatureCardManager section={HOME_ABOUT} heading="HOME_ABOUT Feature Cards" />

          <FeatureCardManager
            section={HOME_STATS}
            heading="Angka Kepercayaan"
            hint="Tampil di beranda di bawah About. Isi hanya angka yang benar (tahun berdiri, kapasitas/bulan, negara tujuan, petani mitra). Kosong = bagian tidak tampil."
            titleLabel="Angka / Nilai"
            titlePlaceholder="±10"
            descriptionLabel="Keterangan"
            descriptionPlaceholder="Tenaga kerja terampil"
            iconPlaceholder="(tidak dipakai)"
            addLabel="Tambah Angka"
          />

          <FeatureCardManager
            section={HOME_CERTIFICATIONS}
            heading="Sertifikasi & Legalitas"
            hint="Hanya dokumen yang benar-benar dimiliki (NIB, PIRT, Halal, HACCP, ISO, dll.). Kosong = bagian tidak tampil."
            titleLabel="Nama sertifikat / izin"
            titlePlaceholder="NIB"
            descriptionLabel="Nomor / keterangan (opsional)"
            descriptionPlaceholder="No. 1234567890123"
            descriptionRequired={false}
            iconPlaceholder="CheckCircle2"
            addLabel="Tambah Sertifikasi"
          />

          <ProcessStepsEditor steps={processSteps} />
        </div>
      </div>
    </div>
  );
}
