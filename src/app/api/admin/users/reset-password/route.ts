import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH, setCredentialPassword } from "@/lib/reset-password";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: "Tidak diizinkan" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const userId = body?.userId;
    const newPassword = body?.newPassword;

    if (
      typeof userId !== "string" ||
      typeof newPassword !== "string" ||
      newPassword.length < MIN_PASSWORD_LENGTH
    ) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid" },
        { status: 400 }
      );
    }

    // Hash memakai hasher better-auth (scrypt) agar login email/password menerimanya.
    const ctx = await auth.$context;
    const result = await setCredentialPassword(prisma, ctx.password.hash, userId, newPassword);
    if (result === "not-found") {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Gagal mereset password" },
      { status: 500 }
    );
  }
}

