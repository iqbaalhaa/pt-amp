"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    const dataToUpdate: Record<string, string> = {};
    
    // Fields mapped to their database column names
    const fields = [
      'address', 'phone', 'email', 'whatsapp'
    ];

    // Only update fields that are actually present in the FormData
    // This allows for partial updates (splitting the form into multiple sections)
    fields.forEach(field => {
      if (formData.has(field)) {
        dataToUpdate[field] = formData.get(field) as string;
      }
    });

    // Check if a record exists
    const existing = await prisma.contactInfo.findFirst();

    if (existing) {
      await prisma.contactInfo.update({
        where: { id: existing.id },
        data: dataToUpdate,
      });
    } else {
      // If no record exists, create one with the provided data
      // Note: This might create a record with partial nulls if not all fields are provided, 
      // which is fine as they are optional/nullable in schema (usually)
      await prisma.contactInfo.create({
        data: dataToUpdate as any, // Cast to any to bypass strict type check for creation if partial
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
