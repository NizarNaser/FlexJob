import "dotenv/config";
import { PrismaClient, Day, ContractType, ScheduleType } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const dayMap: Record<string, Day> = {
  Mon: Day.MON,
  Tue: Day.TUE,
  Wed: Day.WED,
  Thu: Day.THU,
  Fri: Day.FRI,
  Sat: Day.SAT,
  Sun: Day.SUN,
};

async function main() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const managerEmails = (process.env.MANAGER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  for (const email of adminEmails) {
    await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN" },
      create: { email, name: email.split("@")[0], role: "ADMIN" },
    });
  }
  for (const email of managerEmails) {
    await prisma.user.upsert({
      where: { email },
      update: { role: "MANAGER" },
      create: { email, name: email.split("@")[0], role: "MANAGER" },
    });
  }

  const employersData = [
    { key: "e1", name: "Blue Leaf Cafe", email: "seed-e1@flexjob.demo", description: "A cozy neighborhood cafe looking for friendly, flexible baristas.", location: "Austin, TX", verified: true },
    { key: "e2", name: "BrightBox Logistics", email: "seed-e2@flexjob.demo", description: "Warehouse and delivery operations with flexible shift options.", location: "Chicago, IL", verified: true },
    { key: "e3", name: "TutorNest", email: "seed-e3@flexjob.demo", description: "Online tutoring platform connecting students with part-time tutors.", location: "Remote", verified: true },
    { key: "e4", name: "GreenLawn Services", email: "seed-e4@flexjob.demo", description: "Landscaping and yard-care company hiring seasonal help.", location: "Denver, CO", verified: false },
    { key: "e5", name: "PixelDesk Studio", email: "seed-e5@flexjob.demo", description: "Small creative agency needing part-time freelance support.", location: "Remote", verified: true },
  ];

  const employerIdByKey: Record<string, string> = {};
  for (const e of employersData) {
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: {},
      create: { email: e.email, name: e.name, role: "EMPLOYER" },
    });
    const profile = await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: { description: e.description, location: e.location, verified: e.verified },
      create: {
        userId: user.id,
        description: e.description,
        location: e.location,
        verified: e.verified,
      },
    });
    employerIdByKey[e.key] = profile.id;
  }

  const workersData = [
    {
      key: "w1",
      name: "Maria Gomez",
      email: "seed-w1@flexjob.demo",
      bio: "Reliable and energetic, 3 years of cafe and retail experience.",
      skills: "Customer Service,Barista,Cash Handling",
      location: "Austin, TX",
      cvSummary: "Barista at Sunrise Coffee (2 yrs), Retail associate at Target (1 yr).",
      availability: [
        { day: "Mon", start: 8, end: 14 },
        { day: "Wed", start: 8, end: 14 },
        { day: "Fri", start: 8, end: 18 },
      ],
    },
    {
      key: "w2",
      name: "Daniel Kim",
      email: "seed-w2@flexjob.demo",
      bio: "Physically fit, punctual, comfortable with early shifts.",
      skills: "Warehouse,Forklift,Delivery Driving",
      location: "Chicago, IL",
      cvSummary: "Warehouse associate at FastShip (3 yrs), licensed forklift operator.",
      availability: [
        { day: "Tue", start: 5, end: 12 },
        { day: "Thu", start: 5, end: 12 },
        { day: "Sat", start: 6, end: 16 },
      ],
    },
    {
      key: "w3",
      name: "Aisha Rahman",
      email: "seed-w3@flexjob.demo",
      bio: "Certified math teacher offering evening tutoring sessions.",
      skills: "Math Tutoring,SAT Prep,Online Teaching",
      location: "Remote",
      cvSummary: "5 years tutoring high-school math and SAT prep online.",
      availability: [
        { day: "Mon", start: 17, end: 21 },
        { day: "Tue", start: 17, end: 21 },
        { day: "Wed", start: 17, end: 21 },
        { day: "Sun", start: 10, end: 16 },
      ],
    },
    {
      key: "w4",
      name: "Jordan Miller",
      email: "seed-w4@flexjob.demo",
      bio: "Seasonal landscaping worker, available most weekends.",
      skills: "Landscaping,Lawn Care,Manual Labor",
      location: "Denver, CO",
      cvSummary: "Seasonal groundskeeper (2 seasons), landscaping crew member.",
      availability: [
        { day: "Sat", start: 7, end: 15 },
        { day: "Sun", start: 7, end: 15 },
      ],
    },
    {
      key: "w5",
      name: "Elena Petrova",
      email: "seed-w5@flexjob.demo",
      bio: "Freelance graphic designer available for short remote gigs.",
      skills: "Graphic Design,Figma,Branding",
      location: "Remote",
      cvSummary: "Freelance designer, 4 years, worked with 20+ small businesses.",
      availability: [
        { day: "Mon", start: 9, end: 13 },
        { day: "Wed", start: 9, end: 13 },
        { day: "Thu", start: 13, end: 18 },
      ],
    },
  ];

  const workerUserIdByKey: Record<string, string> = {};
  for (const w of workersData) {
    const user = await prisma.user.upsert({
      where: { email: w.email },
      update: {},
      create: { email: w.email, name: w.name, role: "WORKER" },
    });
    workerUserIdByKey[w.key] = user.id;
    const profile = await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: { bio: w.bio, skills: w.skills, location: w.location, cvSummary: w.cvSummary },
      create: {
        userId: user.id,
        bio: w.bio,
        skills: w.skills,
        location: w.location,
        cvSummary: w.cvSummary,
      },
    });
    await prisma.availabilitySlot.deleteMany({ where: { workerProfileId: profile.id } });
    for (const slot of w.availability) {
      await prisma.availabilitySlot.create({
        data: { workerProfileId: profile.id, day: dayMap[slot.day], start: slot.start, end: slot.end },
      });
    }
  }

  const jobsData = [
    {
      title: "Part-Time Barista",
      employerKey: "e1",
      category: "Food & Beverage",
      description: "Looking for a friendly barista to cover morning and early-afternoon shifts. Choose the days that work for you.",
      location: "Austin, TX",
      remote: false,
      payRate: 17,
      contractType: ContractType.PART_TIME,
      scheduleType: ScheduleType.FLEXIBLE,
      timeOfDay: "MORNING,AFTERNOON",
      urgent: true,
      requiredSlots: [
        { day: "Mon", start: 7, end: 15 },
        { day: "Tue", start: 7, end: 15 },
        { day: "Wed", start: 7, end: 15 },
        { day: "Thu", start: 7, end: 15 },
        { day: "Fri", start: 7, end: 15 },
      ],
    },
    {
      title: "Warehouse Picker (Early Shift)",
      employerKey: "e2",
      category: "Warehouse & Logistics",
      description: "Pick and pack orders during early morning shifts. Set your own days each week.",
      location: "Chicago, IL",
      remote: false,
      payRate: 19.5,
      contractType: ContractType.PART_TIME,
      scheduleType: ScheduleType.SHIFTS,
      timeOfDay: "MORNING",
      urgent: false,
      requiredSlots: [
        { day: "Tue", start: 5, end: 12 },
        { day: "Thu", start: 5, end: 12 },
        { day: "Sat", start: 5, end: 14 },
      ],
    },
    {
      title: "Online Math Tutor",
      employerKey: "e3",
      category: "Education",
      description: "Tutor high-school students in algebra and geometry over evening video calls.",
      location: "Remote",
      remote: true,
      payRate: 28,
      contractType: ContractType.PART_TIME,
      scheduleType: ScheduleType.FLEXIBLE,
      timeOfDay: "AFTERNOON,EVENING",
      urgent: false,
      requiredSlots: [
        { day: "Mon", start: 16, end: 21 },
        { day: "Tue", start: 16, end: 21 },
        { day: "Wed", start: 16, end: 21 },
        { day: "Sun", start: 10, end: 18 },
      ],
    },
    {
      title: "Weekend Landscaping Crew",
      employerKey: "e4",
      category: "Outdoor & Manual Labor",
      description: "Seasonal weekend crew for mowing, trimming, and yard cleanup.",
      location: "Denver, CO",
      remote: false,
      payRate: 20,
      contractType: ContractType.SEASONAL,
      scheduleType: ScheduleType.FIXED,
      timeOfDay: "MORNING,AFTERNOON",
      urgent: false,
      requiredSlots: [
        { day: "Sat", start: 7, end: 15 },
        { day: "Sun", start: 7, end: 15 },
      ],
    },
    {
      title: "Freelance Social Media Graphics",
      employerKey: "e5",
      category: "Design & Creative",
      description: "Design a batch of social posts each week. Fully remote, flexible hours.",
      location: "Remote",
      remote: true,
      payRate: 25,
      contractType: ContractType.ONE_TIME,
      scheduleType: ScheduleType.FLEXIBLE,
      timeOfDay: "MORNING,AFTERNOON",
      urgent: true,
      requiredSlots: [
        { day: "Mon", start: 9, end: 18 },
        { day: "Wed", start: 9, end: 18 },
        { day: "Thu", start: 9, end: 18 },
      ],
    },
    {
      title: "Evening Delivery Driver",
      employerKey: "e2",
      category: "Warehouse & Logistics",
      description: "Deliver local packages during evening hours, choose your own shift length.",
      location: "Chicago, IL",
      remote: false,
      payRate: 21,
      contractType: ContractType.PART_TIME,
      scheduleType: ScheduleType.SHIFTS,
      timeOfDay: "EVENING,NIGHT",
      urgent: false,
      requiredSlots: [
        { day: "Mon", start: 17, end: 22 },
        { day: "Wed", start: 17, end: 22 },
        { day: "Fri", start: 17, end: 23 },
      ],
    },
    {
      title: "Cafe Weekend Support",
      employerKey: "e1",
      category: "Food & Beverage",
      description: "Extra hands for busy weekend mornings. Great for students.",
      location: "Austin, TX",
      remote: false,
      payRate: 16.5,
      contractType: ContractType.ONE_TIME,
      scheduleType: ScheduleType.FLEXIBLE,
      timeOfDay: "MORNING",
      urgent: false,
      requiredSlots: [
        { day: "Sat", start: 7, end: 13 },
        { day: "Sun", start: 7, end: 13 },
      ],
    },
    {
      title: "Remote English Conversation Tutor",
      employerKey: "e3",
      category: "Education",
      description: "Host casual conversation practice sessions for adult learners.",
      location: "Remote",
      remote: true,
      payRate: 22,
      contractType: ContractType.PART_TIME,
      scheduleType: ScheduleType.FLEXIBLE,
      timeOfDay: "AFTERNOON,EVENING",
      urgent: false,
      requiredSlots: [
        { day: "Tue", start: 18, end: 21 },
        { day: "Thu", start: 18, end: 21 },
        { day: "Sat", start: 10, end: 14 },
      ],
    },
  ];

  await prisma.job.deleteMany({});
  for (const j of jobsData) {
    const job = await prisma.job.create({
      data: {
        title: j.title,
        employerId: employerIdByKey[j.employerKey],
        category: j.category,
        description: j.description,
        location: j.location,
        remote: j.remote,
        payRate: j.payRate,
        contractType: j.contractType,
        scheduleType: j.scheduleType,
        timeOfDay: j.timeOfDay,
        urgent: j.urgent,
      },
    });
    for (const slot of j.requiredSlots) {
      await prisma.jobRequiredSlot.create({
        data: { jobId: job.id, day: dayMap[slot.day], start: slot.start, end: slot.end },
      });
    }
  }

  const reviews = [
    { authorKey: "e1", targetKey: "w1", isEmployerAuthor: true, rating: 5, comment: "Maria was always on time and great with customers. Highly recommend!" },
    { authorKey: "w1", targetKey: "e1", isEmployerAuthor: false, rating: 5, comment: "Great team, flexible with my schedule changes." },
    { authorKey: "e2", targetKey: "w2", isEmployerAuthor: true, rating: 4, comment: "Solid worker, occasionally ran a few minutes late." },
    { authorKey: "e3", targetKey: "w3", isEmployerAuthor: true, rating: 5, comment: "Aisha's students consistently improve. Excellent tutor." },
    { authorKey: "w2", targetKey: "e2", isEmployerAuthor: false, rating: 4, comment: "Fair pay and clear shift schedules." },
  ];

  await prisma.review.deleteMany({});
  const employerUserIdByProfileKey: Record<string, string> = {};
  for (const e of employersData) {
    const profile = await prisma.employerProfile.findUnique({ where: { id: employerIdByKey[e.key] } });
    employerUserIdByProfileKey[e.key] = profile!.userId;
  }

  for (const r of reviews) {
    const authorUserId = r.isEmployerAuthor ? employerUserIdByProfileKey[r.authorKey] : workerUserIdByKey[r.authorKey];
    const targetUserId = r.isEmployerAuthor ? workerUserIdByKey[r.targetKey] : employerUserIdByProfileKey[r.targetKey];
    await prisma.review.create({
      data: { authorId: authorUserId, targetId: targetUserId, rating: r.rating, comment: r.comment, verified: true },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
