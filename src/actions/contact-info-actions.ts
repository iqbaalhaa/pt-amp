"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

export async function getContactInfo() {
  try {
    const contactInfo = await prisma.contactInfo.findFirst();
    return contactInfo;
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return null;
  }
}

export async function updateContactInfo(formData: FormData) {
  try {
    const address = formData.get("address");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const whatsapp = formData.get("whatsapp");

    const updateData: Prisma.ContactInfoUpdateInput = {
      ...(address !== null ? { address: String(address) } : {}),
      ...(phone !== null ? { phone: String(phone) } : {}),
      ...(email !== null ? { email: String(email) } : {}),
      ...(whatsapp !== null ? { whatsapp: String(whatsapp) } : {}),
    };

    // Check if a record exists
    const existing = await prisma.contactInfo.findFirst();

    if (existing) {
      await prisma.contactInfo.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      await prisma.contactInfo.create({
        data: updateData as Prisma.ContactInfoCreateInput,
      });
    }

    revalidatePath("/contact");
    revalidatePath("/admin/compro/contact");
    return { success: true };
  } catch (error) {
    console.error("Error updating contact info:", error);
    return { success: false, error: "Failed to update contact info" };
  }
}
