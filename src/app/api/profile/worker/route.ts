import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.user.role === "EMPLOYER") {
    return NextResponse.json({ error: "This account is already registered as an employer" }, { status: 400 });
  }
  if (session.user.role === "ADMIN" || session.user.role === "MANAGER") {
    return NextResponse.json({ error: "Admin/manager accounts can't hold a worker profile" }, { status: 400 });
  }

  const body = await req.json();
  const { bio, skills, location, cvSummary } = body as {
    bio?: string;
    skills?: string[];
    location?: string;
    cvSummary?: string;
  };

  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { role: "WORKER" } }),
    prisma.workerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(bio !== undefined ? { bio } : {}),
        ...(skills !== undefined ? { skills: skills.join(",") } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(cvSummary !== undefined ? { cvSummary } : {}),
      },
      create: {
        userId: session.user.id,
        bio: bio ?? "",
        skills: skills?.join(",") ?? "",
        location: location ?? "Not set",
        cvSummary: cvSummary ?? "No CV uploaded yet.",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
