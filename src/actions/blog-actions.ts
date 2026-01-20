"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";

// Utility to handle file uploads
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

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getPosts(page: number = 1, pageSize: number = 10) {
  const skip = (page - 1) * pageSize;
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });
  
  const total = await prisma.post.count();
  
  return {
    posts,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });
}

export async function createPost(formData: FormData) {
  const title = (formData.get("title") as string) || "";
  const content = (formData.get("content") as string) || "";
  const published = formData.get("published") === "true";
  const authorId = (formData.get("authorId") as string) || "";
  
  let image = "";
  const file = formData.get("imageFile") as File | null;
  if (file && file.size > 0) {
    const uploaded = await saveUploadToPublic(file);
    if (uploaded) image = uploaded;
  }

  // Generate unique slug
  let slug = generateSlug(title);
  let counter = 1;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }

  await prisma.post.create({
    data: {
      title,
      slug,
      content,
      image: image || null,
      published,
      authorId,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/compro/blog");
  return { success: true };
}

export async function updatePost(id: string, formData: FormData) {
  const title = (formData.get("title") as string) || "";
  const content = (formData.get("content") as string) || "";
  const published = formData.get("published") === "true";
  const existingImage = (formData.get("existingImage") as string) || "";
  
  let image = existingImage;
  const file = formData.get("imageFile") as File | null;
  if (file && file.size > 0) {
    const uploaded = await saveUploadToPublic(file);
    if (uploaded) image = uploaded;
  }

  // Update slug if title changed (optional, maybe better not to change slug to preserve SEO)
  // For now, let's keep slug stable unless explicitly requested, but here we just keep it as is.
  // Or we can regenerate if needed. Let's stick to stable slug for now.
  
  await prisma.post.update({
    where: { id },
    data: {
      title,
      content,
      image: image || null,
      published,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/compro/blog");
  return { success: true };
}

export async function deletePost(id: string) {
  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/blog");
  revalidatePath("/admin/compro/blog");
  return { success: true };
}

export async function uploadImage(formData: FormData) {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { success: false, url: "" };

    const url = await saveUploadToPublic(file);
    if (url) return { success: true, url };
    return { success: false, url: "" };
}
