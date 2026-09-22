"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import Avatar from "./Avatar";

function dashboardHref(role: string) {
  if (role === "admin" || role === "manager") return "/admin";
  if (role === "employer") return "/dashboard/employer";
  return "/dashboard/worker";
}

export default function Navbar() {
  const { currentUser, needsOnboarding } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-blue-700">
          <span className="text-2xl">💼</span>
          FlexJob
        </Link>

        <button
          className="rounded-md border border-blue-200 p-2 text-blue-700 sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className="hidden items-center gap-6 sm:flex">
          <Link href="/jobs" className="text-sm font-medium text-slate-600 hover:text-blue-700">
            Find Work
          </Link>
          <Link href="/jobs/new" className="text-sm font-medium text-slate-600 hover:text-blue-700">
            Post a Job
          </Link>
          {currentUser ? (
            <>
              <Link
                href={dashboardHref(currentUser.role)}
                className="text-sm font-medium text-slate-600 hover:text-blue-700"
              >
                {currentUser.role === "admin" || currentUser.role === "manager" ? "Control Panel" : "Dashboard"}
              </Link>
              <Avatar src={currentUser.image} size={28} />
              <span className="text-sm text-slate-500">{currentUser.name.split(" ")[0]}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-blue-200 px-4 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                Log out
              </button>
            </>
          ) : needsOnboarding ? (
            <Link
              href="/welcome"
              className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Finish setting up
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-700">
                Log in
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      {open && (
        <div className="flex flex-col gap-3 border-t border-blue-100 bg-white px-4 py-4 sm:hidden">
          <Link href="/jobs" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600">
            Find Work
          </Link>
          <Link href="/jobs/new" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600">
            Post a Job
          </Link>
          {currentUser ? (
            <>
              <Link
                href={dashboardHref(currentUser.role)}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-600"
              >
                {currentUser.role === "admin" || currentUser.role === "manager" ? "Control Panel" : "Dashboard"}
              </Link>
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setOpen(false);
                }}
                className="rounded-full border border-blue-200 px-4 py-1.5 text-sm font-medium text-blue-700"
              >
                Log out
              </button>
            </>
          ) : needsOnboarding ? (
            <Link
              href="/welcome"
              onClick={() => setOpen(false)}
              className="rounded-full bg-blue-600 px-4 py-1.5 text-center text-sm font-medium text-white"
            >
              Finish setting up
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600">
                Log in
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-full bg-blue-600 px-4 py-1.5 text-center text-sm font-medium text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
