"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
}

export async function deleteFeatureCard(id: string) {
  await prisma.featureCard.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/cms/pages/home");
  revalidatePath("/admin/compro/about");
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
