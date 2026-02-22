
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { uploadToS3 } from "../src/lib/s3";
import fs from "fs";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "public", "_uploads_backup");

async function migrateItemTypes() {
  console.log("Migrating ItemTypes...");
  const items = await prisma.itemType.findMany({
    where: {
      image: {
        startsWith: "/uploads/",
      },
    },
  });

  for (const item of items) {
    if (!item.image) continue;
    const filename = path.basename(item.image);
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
      console.log(`Uploading ${filename} for ItemType ${item.name}...`);
      const fileBuffer = fs.readFileSync(filePath);
      const contentType = "image/jpeg"; // Default or detect
      const s3Url = await uploadToS3(fileBuffer, `products/${filename}`, contentType);
      
      await prisma.itemType.update({
        where: { id: item.id },
        data: { image: s3Url },
      });
      console.log(`Updated ItemType ${item.name} to ${s3Url}`);
    } else {
      console.warn(`File not found: ${filePath} for ItemType ${item.name}`);
    }
  }
}

async function migrateHeroSlides() {
  console.log("Migrating HeroSlides...");
  const slides = await prisma.heroSlide.findMany({
    where: {
      src: {
        startsWith: "/uploads/",
      },
    },
  });

  for (const slide of slides) {
    const filename = path.basename(slide.src);
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
      console.log(`Uploading ${filename} for HeroSlide ${slide.title}...`);
      const fileBuffer = fs.readFileSync(filePath);
      const contentType = "image/jpeg";
      const s3Url = await uploadToS3(fileBuffer, `hero/${filename}`, contentType);
      
      await prisma.heroSlide.update({
        where: { id: slide.id },
        data: { src: s3Url },
      });
      console.log(`Updated HeroSlide ${slide.title} to ${s3Url}`);
    } else {
      console.warn(`File not found: ${filePath} for HeroSlide ${slide.title}`);
    }
  }
}

async function migrateGalleryAlbums() {
  console.log("Migrating GalleryAlbums...");
  const albums = await prisma.galleryAlbum.findMany({
    where: {
      coverImage: {
        startsWith: "/uploads/",
      },
    },
  });

  for (const album of albums) {
    const filename = path.basename(album.coverImage);
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
      console.log(`Uploading ${filename} for GalleryAlbum ${album.title}...`);
      const fileBuffer = fs.readFileSync(filePath);
      const contentType = "image/jpeg";
      const s3Url = await uploadToS3(fileBuffer, `gallery/${filename}`, contentType);
      
      await prisma.galleryAlbum.update({
        where: { id: album.id },
        data: { coverImage: s3Url },
      });
      console.log(`Updated GalleryAlbum ${album.title} to ${s3Url}`);
    } else {
      console.warn(`File not found: ${filePath} for GalleryAlbum ${album.title}`);
    }
  }
}

async function migratePosts() {
  console.log("Migrating Posts...");
  const posts = await prisma.post.findMany({
    where: {
      image: {
        startsWith: "/uploads/",
      },
    },
  });

  for (const post of posts) {
    if (!post.image) continue;
    const filename = path.basename(post.image);
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
      console.log(`Uploading ${filename} for Post ${post.title}...`);
      const fileBuffer = fs.readFileSync(filePath);
      const contentType = "image/jpeg";
      const s3Url = await uploadToS3(fileBuffer, `blog/${filename}`, contentType);
      
      await prisma.post.update({
        where: { id: post.id },
        data: { image: s3Url },
      });
      console.log(`Updated Post ${post.title} to ${s3Url}`);
    } else {
      console.warn(`File not found: ${filePath} for Post ${post.title}`);
    }
  }
}

async function main() {
  try {
    await migrateItemTypes();
    await migrateHeroSlides();
    await migrateGalleryAlbums();
    await migratePosts();
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
