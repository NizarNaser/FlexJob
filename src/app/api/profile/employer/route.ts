import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.user.role === "WORKER") {
    return NextResponse.json({ error: "This account is already registered as a worker" }, { status: 400 });
  }
  if (session.user.role === "ADMIN" || session.user.role === "MANAGER") {
    return NextResponse.json({ error: "Admin/manager accounts can't hold an employer profile" }, { status: 400 });
  }

  const body = await req.json();
  const { description, location } = body as { description?: string; location?: string };

  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { role: "EMPLOYER" } }),
    prisma.employerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(description !== undefined ? { description } : {}),
        ...(location !== undefined ? { location } : {}),
      },
      create: {
        userId: session.user.id,
        description: description ?? "New employer on FlexJob.",
        location: location ?? "Not set",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
