import { PrismaClient } from "../../src/generated/prisma";

export async function seedContent(prisma: PrismaClient) {
  console.log("🌱 Seeding CMS Content...");

  // 1. Home Page Content
  const homePage = await prisma.homePage.findFirst();
  if (!homePage) {
    await prisma.homePage.create({
      data: {
        aboutTitle: "About Us",
        aboutDescription:
          "Kami membeli kulit manis dari petani, melakukan pembersihan, pengikisan, penjemuran, dan pengemasan dalam ball 40–60 kg. Dengan tim ±10 orang, kami menjaga kualitas untuk memenuhi kebutuhan pasar lokal dan ekspor.",
      },
    });
    console.log("   - Home Page content seeded");
  }

  // 2. Hero Slides
  const slidesCount = await prisma.heroSlide.count();
  if (slidesCount === 0) {
    await prisma.heroSlide.create({
      data: {
        id: "slide-1",
        type: "image",
        src: "https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop",
        title: "Company Profile",
        description:
          "Perusahaan kulit manis skala UMKM–menengah. Fokus pada pembelian bahan mentah, proses pembersihan dan preparasi, hingga penjualan produk berkualitas.",
        order: 1,
        buttons: {
          create: [
            { text: "Lihat Produk", href: "#products", isPrimary: true },
            { text: "Lihat Blog", href: "/blog", isPrimary: false },
          ],
        },
      },
    });

    await prisma.heroSlide.create({
      data: {
        id: "slide-2",
        type: "video",
        src: "https://videos.pexels.com/video-files/4440816/4440816-hd_1920_1080_30fps.mp4",
        title: "Proses Berkualitas",
        description:
          "Menggunakan metode pengolahan tradisional yang dipadukan dengan standar kebersihan modern untuk menghasilkan kulit manis terbaik.",
        order: 2,
        buttons: {
          create: [{ text: "Pelajari Proses", href: "#about", isPrimary: true }],
        },
      },
    });

    await prisma.heroSlide.create({
      data: {
        id: "slide-3",
        type: "image",
        src: "https://images.unsplash.com/photo-1615485925763-867862f80933?q=80&w=2074&auto=format&fit=crop",
        title: "Pasar Global",
        description:
          "Siap memenuhi kebutuhan pasar lokal maupun ekspor dengan kapasitas produksi yang stabil dan kualitas terjaga.",
        order: 3,
        buttons: {
          create: [{ text: "Hubungi Kami", href: "#contact", isPrimary: true }],
        },
      },
    });
    console.log("   - Hero Slides seeded");
  }

  // 3. Home Feature Cards
  const homeCardsCount = await prisma.featureCard.count({
    where: { section: "HOME_ABOUT" },
  });
  if (homeCardsCount === 0) {
    await prisma.featureCard.createMany({
      data: [
        {
          section: "HOME_ABOUT",
          title: "Pengadaan",
          description: "Kemitraan dengan petani untuk bahan baku berkualitas.",
          icon: "Handshake", // Placeholder name
          order: 1,
        },
        {
          section: "HOME_ABOUT",
          title: "Proses",
          description:
            "Pembersihan, pengikisan, penjemuran, dan pengemasan standar.",
          icon: "Settings", // Placeholder name
          order: 2,
        },
        {
          section: "HOME_ABOUT",
          title: "Penjualan",
          description: "Distribusi produk siap jual dengan kontrol mutu.",
          icon: "Truck", // Placeholder name
          order: 3,
        },
      ],
    });
    console.log("   - Home Feature Cards seeded");
  }

  // 4. About Page Content
  const aboutPage = await prisma.aboutPage.findFirst();
  if (!aboutPage) {
    await prisma.aboutPage.create({
      data: {
        heroTitle: "Dedikasi untuk Kualitas & Keaslian Kulit Manis",
        heroDescription:
          "PT AMP berdiri dengan visi mengangkat potensi komoditas lokal ke pasar global. Kami menjembatani petani kulit manis dengan industri melalui proses pengolahan yang terstandarisasi, transparan, dan berkelanjutan.",
        mainTitle: "Siapa Kami?",
        mainDescription:
          "Kami adalah perusahaan pengolahan kulit manis (Cinnamomum burmannii) skala menengah yang berlokasi di Sumatera Barat. Fokus utama kami adalah pembelian bahan mentah langsung dari petani, melakukan pembersihan, pengikisan, penjemuran, dan pengemasan profesional.\n\nDengan dukungan tim ±10 tenaga kerja terampil, kami memproses bahan baku menjadi produk setengah jadi (Grade A, B, Broken) yang siap diekspor atau didistribusikan ke industri makanan dan farmasi lokal.",
        mainImage:
          "https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop",
        points: {
          create: [
            { text: "Sumber langsung dari petani lokal", order: 1 },
            { text: "Proses sortasi dan grading ketat", order: 2 },
            { text: "Kapasitas suplai stabil", order: 3 },
          ],
        },
      },
    });
    console.log("   - About Page content seeded");
  }

  // 5. About Value Cards
  const aboutCardsCount = await prisma.featureCard.count({
    where: { section: "ABOUT_VALUES" },
  });
  if (aboutCardsCount === 0) {
    await prisma.featureCard.createMany({
      data: [
        {
          section: "ABOUT_VALUES",
          title: "Pengadaan & Kemitraan",
          description:
            "Kami membangun hubungan jangka panjang dengan petani. Transparansi penimbangan dan pembayaran yang adil adalah prioritas kami untuk menjaga keberlanjutan pasokan bahan baku.",
          icon: "Users",
          order: 1,
        },
        {
          section: "ABOUT_VALUES",
          title: "Proses & Kualitas",
          description:
            "Setiap batang kulit manis melalui tahap pembersihan, pengikisan kulit luar (scraping), dan penjemuran intensif untuk mencapai kadar air ideal sebelum dikemas.",
          icon: "Factory",
          order: 2,
        },
        {
          section: "ABOUT_VALUES",
          title: "Jangkauan Pasar",
          description:
            "Produk kami dikemas dalam ball press 40–60 kg yang efisien untuk pengiriman. Kami melayani kebutuhan industri bumbu, ekstrak, dan eksportir rempah.",
          icon: "Globe2",
          order: 3,
        },
      ],
    });
    console.log("   - About Value Cards seeded");
  }
}
