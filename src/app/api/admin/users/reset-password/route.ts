"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hash } from "bcryptjs";

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
    const userId = body.userId as string | undefined;
    const newPassword = body.newPassword as string | undefined;

    if (!userId || !newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid" },
        { status: 400 }
      );
    }

    const passwordHash = await hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      } as any,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Gagal mereset password" },
      { status: 500 }
    );
  }
}

