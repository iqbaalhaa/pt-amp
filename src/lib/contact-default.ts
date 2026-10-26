// Kontak awal untuk seed CMS; sama dengan teks statis footer/kontak (+62 812 3456 7890).
export const DEFAULT_CONTACT = {
  address: "Jl. Raya Padang - Solok, KM 20, Indarung, Padang, Sumatera Barat, Indonesia",
  phone: "+62 751 123456",
  email: "info@pt-amp.com",
  whatsapp: "6281234567890",
};

// Nomor WA untuk tombol melayang: CMS, kosong → default. Tidak bergantung seed (DB lama tanpa WA tetap dapat tombol).
export function contactWhatsApp(info: { whatsapp?: string | null } | null | undefined): string {
  return info?.whatsapp?.trim() || DEFAULT_CONTACT.whatsapp;
}

type ContactInfoStore = {
  contactInfo: {
    findFirst(): Promise<{ id: string; whatsapp: string | null } | null>;
    create(args: { data: typeof DEFAULT_CONTACT }): Promise<unknown>;
    update(args: { where: { id: string }; data: { whatsapp: string } }): Promise<unknown>;
  };
};

// Isi ContactInfo bila belum ada; WA kosong diisi default (tombol WA melayang butuh nomor). Nilai admin tidak ditimpa.
export async function seedContactInfo(prisma: ContactInfoStore): Promise<"created" | "whatsapp" | null> {
  const info = await prisma.contactInfo.findFirst();
  if (!info) {
    await prisma.contactInfo.create({ data: DEFAULT_CONTACT });
    return "created";
  }
  if (!info.whatsapp?.trim()) {
    await prisma.contactInfo.update({ where: { id: info.id }, data: { whatsapp: DEFAULT_CONTACT.whatsapp } });
    return "whatsapp";
  }
  return null;
}
