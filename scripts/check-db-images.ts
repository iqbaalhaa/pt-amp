import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function checkUrl(url: string): Promise<boolean> {
  if (!url || !url.startsWith("http")) return false;
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function checkImages() {
  console.log("Checking database images...");

  console.log("\n--- ItemType Images ---");
  const itemTypes = await prisma.itemType.findMany({
    where: { image: { not: null } },
    select: { id: true, name: true, image: true },
  });

  for (const it of itemTypes) {
    if (it.image) {
      const isValid = await checkUrl(it.image);
      const status = isValid ? "✅ OK" : "❌ BROKEN";
      console.log(`${status} [${it.name}]: ${it.image}`);
    }
  }

  console.log("\n--- HeroSlide Images ---");
  const heroSlides = await prisma.heroSlide.findMany({
    select: { id: true, title: true, src: true },
  });

  for (const hs of heroSlides) {
    if (hs.src) {
      const isValid = await checkUrl(hs.src);
      const status = isValid ? "✅ OK" : "❌ BROKEN";
      console.log(`${status} [${hs.title}]: ${hs.src}`);
    }
  }

  console.log("\n--- Gallery Album Images ---");
  const albums = await prisma.galleryAlbum.findMany({
    select: { id: true, title: true, coverImage: true },
  });

  for (const a of albums) {
    if (a.coverImage) {
      const isValid = await checkUrl(a.coverImage);
      const status = isValid ? "✅ OK" : "❌ BROKEN";
      console.log(`${status} [${a.title}]: ${a.coverImage}`);
    }
  }

  console.log("\n--- Post Images ---");
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, image: true },
  });

  for (const p of posts) {
    if (p.image) {
      const isValid = await checkUrl(p.image);
      const status = isValid ? "✅ OK" : "❌ BROKEN";
      console.log(`${status} [${p.title}]: ${p.image}`);
    }
  }
}

checkImages()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
