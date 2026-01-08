"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CustomerType } from "@prisma/client";

export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;
  const address = formData.get("address") as string;
  const type = formData.get("type") as CustomerType;
  const notes = formData.get("notes") as string;

  await prisma.customer.create({
    data: {
      name,
      email,
      phone,
      company,
      address,
      type,
      notes,
    },
  });

  revalidatePath("/admin/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;
  const address = formData.get("address") as string;
  const type = formData.get("type") as CustomerType;
  const notes = formData.get("notes") as string;

  await prisma.customer.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      company,
      address,
      type,
      notes,
    },
  });

  revalidatePath("/admin/customers");
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({
    where: { id },
  });

  revalidatePath("/admin/customers");
}
