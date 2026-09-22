import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contractFromDb, scheduleFromDb, slotsFromDb, timeOfDayFromDb } from "@/lib/dbMappers";
import { Employer, Job, Review, Worker } from "@/lib/types";

function ratingFor(reviews: { targetId: string; rating: number }[], targetId: string) {
  const mine = reviews.filter((r) => r.targetId === targetId);
  if (mine.length === 0) return { rating: 0, reviewCount: 0 };
  const avg = mine.reduce((sum, r) => sum + r.rating, 0) / mine.length;
  return { rating: Math.round(avg * 10) / 10, reviewCount: mine.length };
}

export async function GET() {
  const [users, jobs, reviewRows] = await Promise.all([
    prisma.user.findMany({
      include: { workerProfile: { include: { availability: true } }, employerProfile: true },
    }),
    prisma.job.findMany({ include: { requiredSlots: true, employer: { include: { user: true } } } }),
    prisma.review.findMany({ include: { author: true } }),
  ]);

  const reviewRatingSource = reviewRows.map((r) => ({ targetId: r.targetId, rating: r.rating }));

  const workers: Worker[] = users
    .filter((u) => u.workerProfile)
    .map((u) => {
      const p = u.workerProfile!;
      const { rating, reviewCount } = ratingFor(reviewRatingSource, u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.image ?? "🙂",
        bio: p.bio,
        skills: p.skills ? p.skills.split(",").filter(Boolean) : [],
        location: p.location,
        rating,
        reviewCount,
        availability: slotsFromDb(p.availability),
        cvSummary: p.cvSummary,
      };
    });

  const employers: Employer[] = users
    .filter((u) => u.employerProfile)
    .map((u) => {
      const p = u.employerProfile!;
      const { rating, reviewCount } = ratingFor(reviewRatingSource, u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        logo: u.image ?? "🏢",
        description: p.description,
        location: p.location,
        verified: p.verified,
        rating,
        reviewCount,
      };
    });

  const mappedJobs: Job[] = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    employerId: j.employer.user.id,
    employerName: j.employer.user.name,
    category: j.category,
    description: j.description,
    location: j.location,
    remote: j.remote,
    payRate: j.payRate,
    contractType: contractFromDb(j.contractType),
    scheduleType: scheduleFromDb(j.scheduleType),
    requiredSlots: slotsFromDb(j.requiredSlots),
    timeOfDay: timeOfDayFromDb(j.timeOfDay),
    postedDate: j.postedDate.toISOString().slice(0, 10),
    urgent: j.urgent,
  }));

  const userById = new Map(users.map((u) => [u.id, u]));
  const reviews: Review[] = reviewRows.map((r) => {
    const author = userById.get(r.authorId);
    return {
      id: r.id,
      authorName: author?.name ?? "Unknown",
      authorRole: author?.role === "EMPLOYER" ? "employer" : "worker",
      targetId: r.targetId,
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt.toISOString().slice(0, 10),
      verified: r.verified,
    };
  });

  return NextResponse.json({ jobs: mappedJobs, workers, employers, reviews });
}
