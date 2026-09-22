import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { id } = await params;
  const { verified } = (await req.json()) as { verified: boolean };
  const profile = await prisma.employerProfile.findUnique({ where: { userId: id } });
  if (!profile) return NextResponse.json({ error: "Employer not found" }, { status: 404 });
  await prisma.employerProfile.update({ where: { id: profile.id }, data: { verified } });
  return NextResponse.json({ ok: true });
}
