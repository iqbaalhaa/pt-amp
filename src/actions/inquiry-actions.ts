"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { InquiryStatus } from "@/generated/prisma";

export async function getInquiries() {
  return await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createInquiry(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  await prisma.inquiry.create({
    data: {
      name,
      email,
      phone,
      subject,
      message,
    },
  });

  revalidatePath("/admin/inquiries");
  // We don't necessarily need to revalidate "/" unless we show a count there
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  await prisma.inquiry.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(id: string) {
  await prisma.inquiry.delete({
    where: { id },
  });

  revalidatePath("/admin/inquiries");
}
