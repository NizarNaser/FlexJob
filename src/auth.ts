import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "@auth/core/providers";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const managerEmails = (process.env.MANAGER_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function elevatedRoleFor(email: string): Role | undefined {
  const lower = email.toLowerCase();
  if (adminEmails.includes(lower)) return "ADMIN";
  if (managerEmails.includes(lower)) return "MANAGER";
  return undefined;
}

const providers: Provider[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.ENABLE_DEV_LOGIN === "true") {
  providers.push(
    Credentials({
      id: "dev-login",
      name: "Dev sign-in (no password)",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        if (!email) return null;
        const name = (credentials?.name as string | undefined)?.trim() || email.split("@")[0];
        return { id: email, email, name };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();
      const elevated = elevatedRoleFor(email);
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        if (elevated && existing.role !== elevated) {
          await prisma.user.update({ where: { email }, data: { role: elevated } });
        }
      } else {
        await prisma.user.create({
          data: {
            email,
            name: user.name ?? email.split("@")[0],
            image: user.image ?? undefined,
            role: elevated,
          },
        });
      }
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: (token.email as string).toLowerCase() },
          include: { workerProfile: true, employerProfile: true },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.hasWorkerProfile = Boolean(dbUser.workerProfile);
          token.hasEmployerProfile = Boolean(dbUser.employerProfile);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = (token.role as Role | null | undefined) ?? null;
        session.user.hasWorkerProfile = Boolean(token.hasWorkerProfile);
        session.user.hasEmployerProfile = Boolean(token.hasEmployerProfile);
      }
      return session;
    },
  },
});
