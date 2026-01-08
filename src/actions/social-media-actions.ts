"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSocialMedias() {
  return await prisma.socialMedia.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createSocialMedia(formData: FormData) {
  const platform = formData.get("platform") as string;
  const url = formData.get("url") as string;

  if (!platform || !url) return { success: false, error: "Platform and URL are required" };

  await prisma.socialMedia.create({
    data: {
      platform,
      url,
      isActive: true,
    },
  });

  revalidatePath("/contact");
  revalidatePath("/admin/compro/contact");
  return { success: true };
}

export async function updateSocialMedia(id: string, formData: FormData) {
  const platform = formData.get("platform") as string;
  const url = formData.get("url") as string;
  const isActive = formData.get("isActive") === "true";

  await prisma.socialMedia.update({
    where: { id },
    data: {
      platform,
      url,
      isActive,
    },
  });

  revalidatePath("/contact");
  revalidatePath("/admin/compro/contact");
  return { success: true };
}

export async function deleteSocialMedia(id: string) {
  await prisma.socialMedia.delete({
    where: { id },
  });

  revalidatePath("/contact");
  revalidatePath("/admin/compro/contact");
  return { success: true };
}
