"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";

export async function getHomePageData() {
  return await prisma.homePage.findFirst();
}

export async function getHeroSlides() {
  return await prisma.heroSlide.findMany({
    include: {
      buttons: true,
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function createHeroSlide(formData: FormData) {
  let type = (formData.get("type") as string) || "image";
  let src = (formData.get("src") as string) || "";
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    if (file.type.startsWith("video/")) {
      type = "video";
    } else if (file.type.startsWith("image/")) {
      type = "image";
    }
    const uploaded = await saveUploadToPublic(file);
    if (uploaded) src = uploaded;
  }

  await prisma.heroSlide.create({
    data: { type, src, title, description, order },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
}

export async function updateHeroSlide(id: string, formData: FormData) {
  let type = (formData.get("type") as string) || "image";
  let src = (formData.get("src") as string) || "";
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    if (file.type.startsWith("video/")) {
      type = "video";
    } else if (file.type.startsWith("image/")) {
      type = "image";
    }
    const uploaded = await saveUploadToPublic(file);
    if (uploaded) src = uploaded;
  }

  await prisma.heroSlide.update({
    where: { id },
    data: { type, src, title, description, order },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
}

export async function deleteHeroSlide(id: string) {
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
}

export async function createHeroButton(slideId: string, formData: FormData) {
  const text = (formData.get("text") as string) || "";
  const href = (formData.get("href") as string) || "";
  const isPrimary = (formData.get("isPrimary") as string) === "true";

  await prisma.heroButton.create({
    data: { text, href, isPrimary, slideId },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
}

export async function updateHeroButton(id: string, formData: FormData) {
  const text = (formData.get("text") as string) || "";
  const href = (formData.get("href") as string) || "";
  const isPrimary = (formData.get("isPrimary") as string) === "true";

  await prisma.heroButton.update({
    where: { id },
    data: { text, href, isPrimary },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
}

export async function deleteHeroButton(id: string) {
  await prisma.heroButton.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
}

async function saveUploadToPublic(file: File): Promise<string | null> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const ext = path.extname(safeName) || ".png";
    const base = path.basename(safeName, ext);
    const filename = `${base}-${timestamp}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  } catch {
    return null;
  }
}

export async function getFeatureCards(section: string) {
  return await prisma.featureCard.findMany({
    where: {
      section,
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function getAboutPageData() {
  return await prisma.aboutPage.findFirst({
    include: {
      points: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function updateHomePage(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const aboutTitle = (formData.get("aboutTitle") as string) || "";
  const aboutDescription = (formData.get("aboutDescription") as string) || "";

  if (id) {
    await prisma.homePage.update({
      where: { id },
      data: { aboutTitle, aboutDescription },
    });
  } else {
    await prisma.homePage.create({
      data: { aboutTitle, aboutDescription },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
}

export async function updateAboutPage(formData: FormData) {
  const id = (formData.get("id") as string) || undefined;
  const heroTitle = (formData.get("heroTitle") as string) || "";
  const heroDescription = (formData.get("heroDescription") as string) || "";
  const mainTitle = (formData.get("mainTitle") as string) || "";
  const mainDescription = (formData.get("mainDescription") as string) || "";
  const mainImage = (formData.get("mainImage") as string) || "";

  if (id) {
    await prisma.aboutPage.update({
      where: { id },
      data: { heroTitle, heroDescription, mainTitle, mainDescription, mainImage },
    });
  } else {
    await prisma.aboutPage.create({
      data: { heroTitle, heroDescription, mainTitle, mainDescription, mainImage },
    });
  }

  revalidatePath("/about");
  revalidatePath("/admin/compro/about");
}

export async function createFeatureCard(formData: FormData) {
  const section = (formData.get("section") as string) || "";
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const icon = (formData.get("icon") as string) || null;
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  await prisma.featureCard.create({
    data: { section, title, description, icon, order },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
  revalidatePath("/admin/compro/about");
  revalidatePath("/gallery");
  revalidatePath("/admin/compro/gallery");
}

export async function deleteFeatureCard(id: string) {
  await prisma.featureCard.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
  revalidatePath("/admin/compro/about");
  revalidatePath("/gallery");
  revalidatePath("/admin/compro/gallery");
}

export async function updateFeatureCard(id: string, formData: FormData) {
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const icon = (formData.get("icon") as string) || null;
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  await prisma.featureCard.update({
    where: { id },
    data: { title, description, icon, order },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
  revalidatePath("/admin/compro/about");
  revalidatePath("/gallery");
  revalidatePath("/admin/compro/gallery");
}

export async function createAboutPoint(formData: FormData) {
  const aboutPageId = (formData.get("aboutPageId") as string) || "";
  const text = (formData.get("text") as string) || "";
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  if (!aboutPageId) return;

  await prisma.aboutPoint.create({
    data: { aboutPageId, text, order },
  });

  revalidatePath("/about");
  revalidatePath("/admin/compro/about");
}

export async function deleteAboutPoint(id: string) {
  await prisma.aboutPoint.delete({ where: { id } });
  revalidatePath("/about");
  revalidatePath("/admin/compro/about");
}

export async function updateAboutPoint(id: string, formData: FormData) {
  const text = (formData.get("text") as string) || "";
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  await prisma.aboutPoint.update({
    where: { id },
    data: { text, order },
  });

  revalidatePath("/about");
  revalidatePath("/admin/compro/about");
}

export async function getGalleryAlbums() {
  const client: any = prisma;
  if (!client.galleryAlbum) {
    return [];
  }

  return await client.galleryAlbum.findMany({
    include: {
      items: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function createGalleryAlbum(formData: FormData) {
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  let coverImage = (formData.get("coverImage") as string) || "";
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  const file = formData.get("coverFile") as File | null;
  if (file && file.size > 0) {
    const uploaded = await saveUploadToPublic(file);
    if (uploaded) coverImage = uploaded;
  }

  if (!coverImage) {
    return;
  }

  const client: any = prisma;
  if (!client.galleryAlbum) {
    return;
  }

  await client.galleryAlbum.create({
    data: {
      title,
      description,
      coverImage,
      order,
    },
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/compro/gallery");
}

export async function updateGalleryAlbum(id: string, formData: FormData) {
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  let coverImage = (formData.get("coverImage") as string) || "";
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  const file = formData.get("coverFile") as File | null;
  if (file && file.size > 0) {
    const uploaded = await saveUploadToPublic(file);
    if (uploaded) coverImage = uploaded;
  }

  const client: any = prisma;
  if (!client.galleryAlbum) {
    return;
  }

  const data: any = {
    title,
    description,
    order,
  };

  if (coverImage) {
    data.coverImage = coverImage;
  }

  await client.galleryAlbum.update({
    where: { id },
    data,
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/compro/gallery");
}

export async function deleteGalleryAlbum(id: string) {
  const client: any = prisma;
  if (!client.galleryAlbum) {
    return;
  }

  await client.galleryAlbum.delete({
    where: { id },
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/compro/gallery");
}

export async function createGalleryMedia(formData: FormData) {
  const albumId = (formData.get("albumId") as string) || "";
  let type = (formData.get("type") as string) || "image";
  let src = (formData.get("src") as string) || "";
  const caption = (formData.get("caption") as string) || "";
  const thumbnail = (formData.get("thumbnail") as string) || "";
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    if (file.type.startsWith("video/")) {
      type = "video";
    } else if (file.type.startsWith("image/")) {
      type = "image";
    }
    const uploaded = await saveUploadToPublic(file);
    if (uploaded) src = uploaded;
  }

  if (!albumId) return;

  const client: any = prisma;
  if (!client.galleryMedia) {
    return;
  }

  await client.galleryMedia.create({
    data: {
      albumId,
      type,
      src,
      caption,
      thumbnail: thumbnail || null,
      order,
    },
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/compro/gallery");
}

export async function updateGalleryMedia(id: string, formData: FormData) {
  let type = (formData.get("type") as string) || "image";
  let src = (formData.get("src") as string) || "";
  const caption = (formData.get("caption") as string) || "";
  const thumbnail = (formData.get("thumbnail") as string) || "";
  const orderRaw = (formData.get("order") as string) || "0";
  const order = Number(orderRaw) || 0;

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    if (file.type.startsWith("video/")) {
      type = "video";
    } else if (file.type.startsWith("image/")) {
      type = "image";
    }
    const uploaded = await saveUploadToPublic(file);
    if (uploaded) src = uploaded;
  }

  const client: any = prisma;
  if (!client.galleryMedia) {
    return;
  }

  await client.galleryMedia.update({
    where: { id },
    data: {
      type,
      src,
      caption,
      thumbnail: thumbnail || null,
      order,
    },
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/compro/gallery");
}

export async function deleteGalleryMedia(id: string) {
  const client: any = prisma;
  if (!client.galleryMedia) {
    return;
  }

  await client.galleryMedia.delete({
    where: { id },
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/compro/gallery");
}
