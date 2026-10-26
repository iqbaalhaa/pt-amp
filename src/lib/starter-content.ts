import { DEFAULT_IMAGES } from "./default-images";

// Starter blog posts & gallery albums so a fresh install is not empty.
// Seeded only when the table is empty; owner edits/replaces them via admin.
export const STARTER_AUTHOR = {
  id: "amp-editorial",
  name: "Tim PT AMP",
  email: "redaksi@amp.local",
} as const;

// Plain text: BlogDetailPage renders content as text (whitespace-pre-line), not HTML.
export const STARTER_POSTS = [
  {
    slug: "mengenal-grade-kulit-manis-a-b-broken",
    title: "Mengenal Grade Kulit Manis: A, B, dan Broken",
    image: DEFAULT_IMAGES.gradeA,
    content:
      "Kulit manis (Cinnamomum burmannii) kami pilah menjadi tiga grade berdasarkan ketebalan, warna, dan keutuhan batang.\n\n" +
      "- Grade A: batang utuh, warna merata, dikikis bersih.\n" +
      "- Grade B: batang utuh dengan variasi warna atau ketebalan.\n" +
      "- Broken: potongan dan patahan, cocok untuk industri bubuk dan ekstrak.\n\n" +
      "Semua grade dijemur hingga kadar air di bawah 14% sebelum dikemas.",
  },
  {
    slug: "proses-pengolahan-kulit-manis-dari-petani",
    title: "Proses Pengolahan Kulit Manis dari Petani hingga Siap Kirim",
    image: DEFAULT_IMAGES.hero,
    content:
      "Bahan baku kami beli langsung dari petani di Sumatera Barat dengan penimbangan yang transparan.\n\n" +
      "Setelah itu kulit manis dibersihkan, dikikis kulit luarnya, lalu dijemur hingga kering merata. Tahap akhir adalah sortasi grade dan pengemasan.",
  },
  {
    slug: "kemasan-ball-press-40-60-kg-untuk-ekspor",
    title: "Kemasan Ball Press 40–60 kg untuk Pengiriman Ekspor",
    image: DEFAULT_IMAGES.export,
    content:
      "Produk siap jual kami kemas dalam ball press 40–60 kg. Kemasan padat ini menghemat ruang kontainer dan menjaga kulit manis tetap kering selama pengiriman.\n\n" +
      "Hubungi kami untuk informasi kapasitas suplai dan jadwal pengiriman.",
  },
];

export const STARTER_ALBUMS = [
  {
    title: "Produk Kulit Manis",
    description: "Contoh grade kulit manis yang kami olah.",
    coverImage: DEFAULT_IMAGES.gradeA,
    items: [
      { src: DEFAULT_IMAGES.gradeA, caption: "Grade A" },
      { src: DEFAULT_IMAGES.gradeB, caption: "Grade B" },
      { src: DEFAULT_IMAGES.broken, caption: "Broken" },
    ],
  },
  {
    title: "Pengolahan & Pengiriman",
    description: "Dari penjemuran hingga kemasan siap kirim.",
    coverImage: DEFAULT_IMAGES.export,
    items: [
      { src: DEFAULT_IMAGES.hero, caption: "Kulit manis setelah penjemuran" },
      { src: DEFAULT_IMAGES.export, caption: "Kemasan ball press siap kirim" },
    ],
  },
];
