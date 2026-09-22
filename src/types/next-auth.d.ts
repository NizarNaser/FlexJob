import type { Role } from "@/generated/prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role | null;
      hasWorkerProfile: boolean;
      hasEmployerProfile: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: Role | null;
    hasWorkerProfile?: boolean;
    hasEmployerProfile?: boolean;
  }
}
