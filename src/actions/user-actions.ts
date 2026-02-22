"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createUser(data: { name: string; email: string; password: string; role: "STAFF" | "SUPERADMIN" }) {
    try {
        // Use better-auth API to create user. 
        // We do NOT pass headers to avoid setting session cookies on the admin's response.
        const result = await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.name,
            }
        });

        if (result?.user) {
            // Update role manually since it might not be settable via signUp depending on config
            await prisma.user.update({
                where: { id: result.user.id },
                data: { role: data.role }
            });
            
            revalidatePath("/admin/users");
            return { success: true, user: result.user };
        }
        
        return { success: false, error: "Gagal membuat user" };

    } catch (error: any) {
        console.error("Error creating user:", error);
        // Handle better-auth errors (usually APIError)
        const message = error?.body?.message || error?.message || "Gagal membuat user";
        return { success: false, error: message };
    }
}

export async function updateUser(userId: string, data: { name?: string; email?: string; role?: "STAFF" | "SUPERADMIN" }) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
                role: data.role
            }
        });
        
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user:", error);
        return { success: false, error: error.message || "Failed to update user" };
    }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
