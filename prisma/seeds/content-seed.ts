import { PrismaClient } from "@prisma/client";
import { PROCESS_SECTION, DEFAULT_PROCESS_STEPS } from "../../src/lib/process-default";
import { DEFAULT_HERO, LEGACY_HERO_TITLE } from "../../src/lib/hero-default";
import { DEFAULT_IMAGES, DEAD_SEED_IMAGES } from "../../src/lib/default-images";
import { STARTER_ALBUMS, STARTER_AUTHOR, STARTER_POSTS } from "../../src/lib/starter-content";

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
        src: DEFAULT_IMAGES.hero,
        title: DEFAULT_HERO.title,
        description: DEFAULT_HERO.description,
        order: 1,
        buttons: { create: DEFAULT_HERO.buttons },
      },
    });

    await prisma.heroSlide.create({
      data: {
        id: "slide-2",
        type: "image",
        src: DEFAULT_IMAGES.gradeA,
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
        src: DEFAULT_IMAGES.export,
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
  } else {
    // Upgrade the old generic seeded slide; slides edited via CMS are left alone.
    const legacy = await prisma.heroSlide.findFirst({
      where: { id: "slide-1", title: LEGACY_HERO_TITLE },
    });
    if (legacy) {
      await prisma.heroSlide.update({
        where: { id: legacy.id },
        data: {
          title: DEFAULT_HERO.title,
          description: DEFAULT_HERO.description,
          buttons: { deleteMany: {}, create: DEFAULT_HERO.buttons },
        },
      });
      console.log("   - Hero slide-1 updated to export CTA");
    }
    // Replace dead seeded stock URLs (404) with local images.
    for (const [deadSrc, localSrc] of Object.entries(DEAD_SEED_IMAGES)) {
      const { count } = await prisma.heroSlide.updateMany({
        where: { src: deadSrc },
        data: { src: localSrc, type: "image" },
      });
      if (count > 0) console.log(`   - ${count} hero slide(s) moved to ${localSrc}`);
    }
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

  // 3b. Home trust numbers — only facts already in the About copy.
  // Certifications (HOME_CERTIFICATIONS) are not seeded: owner must fill real ones.
  const statsCount = await prisma.featureCard.count({
    where: { section: "HOME_STATS" },
  });
  if (statsCount === 0) {
    await prisma.featureCard.createMany({
      data: [
        { section: "HOME_STATS", title: "±10", description: "Tenaga kerja terampil", order: 1 },
        { section: "HOME_STATS", title: "40–60 kg", description: "Kemasan ball press per bal", order: 2 },
        { section: "HOME_STATS", title: "3 Grade", description: "Grade A, B & Broken", order: 3 },
      ],
    });
    console.log("   - Home trust numbers seeded");
  }

  // 3c. Home "Dari Kebun ke Ekspor" steps (no photos yet: owner uploads real ones via CMS)
  const processCount = await prisma.featureCard.count({
    where: { section: PROCESS_SECTION },
  });
  if (processCount === 0) {
    await prisma.featureCard.createMany({
      data: DEFAULT_PROCESS_STEPS.map((step) => ({ ...step, section: PROCESS_SECTION })),
    });
    console.log("   - Home Process Steps seeded");
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
        mainImage: DEFAULT_IMAGES.hero,
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
  } else if (aboutPage.mainImage && DEAD_SEED_IMAGES[aboutPage.mainImage]) {
    await prisma.aboutPage.update({
      where: { id: aboutPage.id },
      data: { mainImage: DEAD_SEED_IMAGES[aboutPage.mainImage] },
    });
    console.log("   - About Page image moved to local default");
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

  // 6. Starter blog posts (published) so Blog & Latest News are not empty.
  if ((await prisma.post.count()) === 0) {
    // Author: existing user, else a no-login editorial user (no Account row).
    const author =
      (await prisma.user.findFirst({ select: { id: true } })) ??
      (await prisma.user.create({ data: STARTER_AUTHOR, select: { id: true } }));
    for (const post of STARTER_POSTS) {
      await prisma.post.create({ data: { ...post, published: true, authorId: author.id } });
    }
    console.log("   - Starter blog posts seeded");
  }

  // 7. Starter gallery albums so Gallery is not empty.
  if ((await prisma.galleryAlbum.count()) === 0) {
    for (const [i, { items, ...album }] of STARTER_ALBUMS.entries()) {
      await prisma.galleryAlbum.create({
        data: {
          ...album,
          order: i + 1,
          items: {
            create: items.map((item, j) => ({ ...item, type: "image", order: j + 1 })),
          },
        },
      });
    }
    console.log("   - Starter gallery albums seeded");
  }
}
