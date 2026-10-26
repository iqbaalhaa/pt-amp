import {
  createFeatureCard,
  updateFeatureCard,
  deleteFeatureCard,
} from "@/actions/cms-actions";
import { PROCESS_SECTION } from "@/lib/process-default";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  image: string | null;
  order: number;
}

const input = "px-2 py-1.5 border border-zinc-300 rounded-md text-sm";

// CMS editor for the "Dari Kebun ke Ekspor" steps on the home page (FeatureCard section HOME_PROCESS).
export default function ProcessStepsEditor({ steps }: { steps: Step[] }) {
  return (
    <div className="mt-8 pt-6 border-t border-zinc-100">
      <h2 className="text-lg font-semibold text-zinc-800 mb-1">Alur Dari Kebun ke Ekspor</h2>
      <p className="text-sm text-zinc-500 mb-4">
        Langkah tanpa foto tampil dengan ikon. Isi URL foto atau unggah file untuk mengganti ikon dengan foto asli.
        {steps.length === 0 && " Belum ada langkah di CMS: beranda menampilkan 5 langkah default."}
      </p>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col md:flex-row gap-3 p-3 border border-zinc-200 rounded-lg bg-zinc-50">
            <div className="w-24 h-18 shrink-0 rounded-md bg-zinc-200 overflow-hidden flex items-center justify-center text-xs text-zinc-500">
              {step.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
              ) : (
                "Belum ada foto"
              )}
            </div>
            <form
              action={async (formData) => {
                "use server";
                await updateFeatureCard(step.id, formData);
              }}
              className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2"
            >
              <input name="title" defaultValue={step.title} className={input} required />
              <input name="description" defaultValue={step.description} className={`md:col-span-3 ${input}`} />
              <input name="image" defaultValue={step.image ?? ""} className={`md:col-span-2 ${input}`} placeholder="URL foto (kosong = ikon)" />
              <input name="imageFile" type="file" accept="image/*" className={input} />
              <div className="grid grid-cols-2 gap-2">
                <input name="icon" defaultValue={step.icon ?? ""} className={input} placeholder="Icon" />
                <input name="order" type="number" defaultValue={step.order} className={input} placeholder="Order" />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button className="px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs">Simpan Langkah</button>
              </div>
            </form>
            <form
              action={async () => {
                "use server";
                await deleteFeatureCard(step.id);
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
            await createFeatureCard(formData);
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 border border-dashed border-zinc-300 rounded-lg bg-zinc-50/50"
        >
          <input type="hidden" name="section" value={PROCESS_SECTION} />
          <input name="title" className={input} required placeholder="Judul langkah" />
          <input name="description" className={`md:col-span-3 ${input}`} required placeholder="Deskripsi langkah" />
          <input name="image" className={`md:col-span-2 ${input}`} placeholder="URL foto (opsional)" />
          <input name="imageFile" type="file" accept="image/*" className={input} />
          <div className="grid grid-cols-2 gap-2">
            <input name="icon" className={input} placeholder="Sprout / Sun / Ship" />
            <input name="order" type="number" className={input} defaultValue={steps.length + 1} />
          </div>
          <div className="md:col-span-4">
            <button className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-sm">Tambah Langkah</button>
          </div>
        </form>
      </div>
    </div>
  );
}
