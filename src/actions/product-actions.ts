"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const grade = formData.get("grade") as string;
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  const stock = formData.get("stock") ? Number(formData.get("stock")) : 0;
  const image = formData.get("image") as string; // Ideally this handles file upload, but we'll use URL for now

  await prisma.product.create({
    data: {
      name,
      description,
      grade,
      price,
      stock,
      image,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/"); // Update landing page too
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const grade = formData.get("grade") as string;
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  const stock = formData.get("stock") ? Number(formData.get("stock")) : 0;
  const image = formData.get("image") as string;

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      grade,
      price,
      stock,
      image,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
}
