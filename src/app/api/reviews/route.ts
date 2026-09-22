import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "WORKER" && session.user.role !== "EMPLOYER")) {
    return NextResponse.json({ error: "Worker or employer account required" }, { status: 403 });
  }

  const { targetId, rating, comment } = (await req.json()) as {
    targetId: string;
    rating: number;
    comment: string;
  };

  if (!targetId || !comment?.trim() || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }
  if (targetId === session.user.id) {
    return NextResponse.json({ error: "You can't review yourself" }, { status: 400 });
  }

  await prisma.review.create({
    data: {
      authorId: session.user.id,
      targetId,
      rating,
      comment: comment.trim(),
      verified: true,
    },
  });

  return NextResponse.json({ ok: true });
}
