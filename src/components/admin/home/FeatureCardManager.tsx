import {
  getFeatureCards,
  createFeatureCard,
  updateFeatureCard,
  deleteFeatureCard,
} from "@/actions/cms-actions";

type Props = {
  section: string;
  heading: string;
  hint?: string;
  titleLabel?: string;
  titlePlaceholder?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  descriptionRequired?: boolean;
  iconPlaceholder?: string;
  addLabel?: string;
};

// CRUD list for FeatureCard rows of one section (server component).
export default async function FeatureCardManager({
  section,
  heading,
  hint,
  titleLabel = "Judul",
  titlePlaceholder = "Judul Fitur",
  descriptionLabel = "Deskripsi",
  descriptionPlaceholder = "Deskripsi fitur...",
  descriptionRequired = true,
  iconPlaceholder = "Users / Factory / Globe2",
  addLabel = "Tambah Feature Card",
}: Props) {
  const cards = await getFeatureCards(section);

  return (
    <div className="mt-8 pt-6 border-t border-zinc-100">
      <h2 className="text-lg font-semibold text-zinc-800 mb-1">{heading}</h2>
      {hint && <p className="text-sm text-zinc-500 mb-4">{hint}</p>}
      <div className="space-y-3 mt-3">
        {cards.map((card) => (
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
          <input type="hidden" name="section" value={section} />
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">{titleLabel}</label>
            <input name="title" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" required placeholder={titlePlaceholder} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-zinc-700">{descriptionLabel}</label>
            <textarea name="description" className="w-full px-3 py-2 border border-zinc-300 rounded-lg min-h-[80px] text-sm" required={descriptionRequired} placeholder={descriptionPlaceholder} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Icon (lucide name)</label>
            <input name="icon" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" placeholder={iconPlaceholder} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Order</label>
            <input name="order" type="number" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" defaultValue={cards.length + 1} />
          </div>
          <div className="md:col-span-2 pt-2">
            <button className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-sm w-full md:w-auto">{addLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
