import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { contractToDb, dayToDb, scheduleToDb, timeOfDayToDb } from "@/lib/dbMappers";
import { AvailabilitySlot, ContractType, ScheduleType, TimeOfDay } from "@/lib/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Employer account required" }, { status: 403 });
  }

  const employerProfile = await prisma.employerProfile.findUnique({ where: { userId: session.user.id } });
  if (!employerProfile) {
    return NextResponse.json({ error: "Complete your employer profile first" }, { status: 400 });
  }

  const body = await req.json();
  const {
    title,
    category,
    description,
    location,
    remote,
    payRate,
    contractType,
    scheduleType,
    requiredSlots,
    timeOfDay,
    urgent,
  } = body as {
    title: string;
    category: string;
    description: string;
    location: string;
    remote: boolean;
    payRate: number;
    contractType: ContractType;
    scheduleType: ScheduleType;
    requiredSlots: AvailabilitySlot[];
    timeOfDay: TimeOfDay[];
    urgent: boolean;
  };

  if (!title || !description || !location || !requiredSlots?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      title,
      employerId: employerProfile.id,
      category,
      description,
      location,
      remote: Boolean(remote),
      payRate: Number(payRate),
      contractType: contractToDb(contractType),
      scheduleType: scheduleToDb(scheduleType),
      timeOfDay: timeOfDayToDb(timeOfDay ?? []),
      urgent: Boolean(urgent),
      requiredSlots: {
        create: requiredSlots.map((s) => ({ day: dayToDb(s.day), start: s.start, end: s.end })),
      },
    },
  });

  return NextResponse.json({ ok: true, id: job.id });
}
