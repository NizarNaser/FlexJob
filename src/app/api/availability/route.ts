import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dayToDb } from "@/lib/dbMappers";
import { AvailabilitySlot } from "@/lib/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "Worker account required" }, { status: 403 });
  }

  const { slots } = (await req.json()) as { slots: AvailabilitySlot[] };

  const profile = await prisma.workerProfile.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  await prisma.$transaction([
    prisma.availabilitySlot.deleteMany({ where: { workerProfileId: profile.id } }),
    prisma.availabilitySlot.createMany({
      data: slots.map((s) => ({
        workerProfileId: profile.id,
        day: dayToDb(s.day),
        start: s.start,
        end: s.end,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
