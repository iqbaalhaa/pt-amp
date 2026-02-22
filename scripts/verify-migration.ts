import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables manually
const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

// Manually load env vars if dotenv fails or for edge cases
try {
  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"'))
        value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch (e) {
  console.log("Manual env load skipped");
}

async function verifyMigration() {
  // Dynamic import to ensure env vars are loaded first
  const { prisma } = await import("../src/lib/prisma");

  console.log("Verifying migration status...");

  const s3Domain = "is3.cloudhost.id";

  // Check Post images
  const posts = await prisma.post.findMany({
    where: { image: { not: null } },
  });

  const postsTotal = posts.length;
  const postsS3 = posts.filter(
    (p) => p.image && p.image.includes(s3Domain)
  ).length;
  const postsLocal = postsTotal - postsS3;

  console.log(`\nPosts:`);
  console.log(`- Total with images: ${postsTotal}`);
  console.log(`- S3 URLs: ${postsS3}`);
  console.log(`- Local/Other URLs: ${postsLocal}`);

  if (postsLocal > 0) {
    console.log("  Sample local URLs:");
    posts
      .filter((p) => p.image && !p.image.includes(s3Domain))
      .slice(0, 3)
      .forEach((p) => console.log(`  - ${p.image}`));
  }

  // Check GalleryMedia
  const gallery = await prisma.galleryMedia.findMany({
    where: { src: { not: "" } },
  });

  const galleryTotal = gallery.length;
  const galleryS3 = gallery.filter(
    (g) => g.src && g.src.includes(s3Domain)
  ).length;
  const galleryLocal = galleryTotal - galleryS3;

  console.log(`\nGallery Media:`);
  console.log(`- Total items: ${galleryTotal}`);
  console.log(`- S3 URLs: ${galleryS3}`);
  console.log(`- Local/Other URLs: ${galleryLocal}`);

  if (galleryLocal > 0) {
    console.log("  Sample local URLs:");
    gallery
      .filter((g) => g.src && !g.src.includes(s3Domain))
      .slice(0, 3)
      .forEach((g) => console.log(`  - ${g.src}`));
  }

  // Check ItemType images
  const itemTypes = await prisma.itemType.findMany({
    where: { image: { not: null } },
  });

  const itemTypesTotal = itemTypes.length;
  const itemTypesS3 = itemTypes.filter(
    (i) => i.image && i.image.includes(s3Domain)
  ).length;
  const itemTypesLocal = itemTypesTotal - itemTypesS3;

  console.log(`\nItem Types:`);
  console.log(`- Total with images: ${itemTypesTotal}`);
  console.log(`- S3 URLs: ${itemTypesS3}`);
  console.log(`- Local/Other URLs: ${itemTypesLocal}`);

  if (itemTypesLocal > 0) {
    console.log("  Sample local URLs:");
    itemTypes
      .filter((i) => i.image && !i.image.includes(s3Domain))
      .slice(0, 3)
      .forEach((i) => console.log(`  - ${i.image}`));
  }

  // Check HeroButton images (if any have images, schema check needed, assuming none for now based on actions)
}

verifyMigration()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Dynamic import to call disconnect properly
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });
