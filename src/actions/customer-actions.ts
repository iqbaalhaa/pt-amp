"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CustomerType } from "@prisma/client";

export type CustomerDTO = {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	company: string | null;
	address: string | null;
	type: CustomerType;
	notes: string | null;
};

export async function getCustomers(): Promise<CustomerDTO[]> {
	const customers = await prisma.customer.findMany({
		orderBy: { createdAt: "desc" },
	});

	return customers.map((c) => ({
		id: c.id.toString(),
		name: c.name,
		email: c.email,
		phone: c.phone,
		company: c.company,
		address: c.address,
		type: c.type,
		notes: c.notes,
	}));
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
    where: { id: BigInt(id) },
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
    where: { id: BigInt(id) },
  });

  revalidatePath("/admin/customers");
}
