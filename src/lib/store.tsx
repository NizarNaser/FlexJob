"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AppRole,
  AvailabilitySlot,
  CurrentUser,
  Employer,
  Job,
  Review,
  Worker,
} from "./types";

interface Bootstrap {
  jobs: Job[];
  workers: Worker[];
  employers: Employer[];
  reviews: Review[];
}

const empty: Bootstrap = { jobs: [], workers: [], employers: [], reviews: [] };

interface AppContextValue extends Bootstrap {
  loading: boolean;
  authStatus: "loading" | "authenticated" | "unauthenticated";
  needsOnboarding: boolean;
  currentUser: CurrentUser | null;
  refresh: () => Promise<void>;
  addJob: (job: Omit<Job, "id" | "postedDate" | "employerId" | "employerName">) => Promise<void>;
  updateAvailability: (slots: AvailabilitySlot[]) => Promise<void>;
  updateCvSummary: (cvSummary: string) => Promise<void>;
  saveWorkerProfile: (data: {
    bio?: string;
    skills?: string[];
    location?: string;
    cvSummary?: string;
  }) => Promise<void>;
  saveEmployerProfile: (data: { description?: string; location?: string }) => Promise<void>;
  addReview: (review: { targetId: string; rating: number; comment: string }) => Promise<void>;
  getWorkerReviews: (workerId: string) => Review[];
  getEmployerReviews: (employerId: string) => Review[];
  deleteJob: (jobId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  setEmployerVerified: (userId: string, verified: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<Bootstrap>(empty);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/bootstrap", { cache: "no-store" });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial data load on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const currentUser: CurrentUser | null = useMemo(() => {
    if (status !== "authenticated" || !session?.user?.id || !session.user.role) return null;
    return {
      id: session.user.id,
      name: session.user.name ?? session.user.email ?? "User",
      role: session.user.role.toLowerCase() as AppRole,
      image: session.user.image,
    };
  }, [session, status]);

  const needsOnboarding = status === "authenticated" && !session?.user?.role;

  const post = useCallback(
    async (url: string, body: unknown, method: "POST" | "DELETE" | "PATCH" = "POST") => {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Request failed");
      }
      await refresh();
    },
    [refresh]
  );

  const addJob = useCallback(
    async (job: Omit<Job, "id" | "postedDate" | "employerId" | "employerName">) => {
      await post("/api/jobs", job, "POST");
    },
    [post]
  );

  const updateAvailability = useCallback(
    async (slots: AvailabilitySlot[]) => {
      await post("/api/availability", { slots }, "POST");
    },
    [post]
  );

  const updateCvSummary = useCallback(
    async (cvSummary: string) => {
      await post("/api/profile/worker", { cvSummary }, "POST");
    },
    [post]
  );

  const saveWorkerProfile = useCallback(
    async (data: Parameters<AppContextValue["saveWorkerProfile"]>[0]) => {
      await post("/api/profile/worker", data, "POST");
    },
    [post]
  );

  const saveEmployerProfile = useCallback(
    async (data: Parameters<AppContextValue["saveEmployerProfile"]>[0]) => {
      await post("/api/profile/employer", data, "POST");
    },
    [post]
  );

  const addReview = useCallback(
    async (review: { targetId: string; rating: number; comment: string }) => {
      await post("/api/reviews", review, "POST");
    },
    [post]
  );

  const deleteJob = useCallback(
    async (jobId: string) => {
      await post(`/api/jobs/${jobId}`, undefined, "DELETE");
    },
    [post]
  );

  const deleteReview = useCallback(
    async (reviewId: string) => {
      await post(`/api/reviews/${reviewId}`, undefined, "DELETE");
    },
    [post]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      await post(`/api/admin/users/${userId}`, undefined, "DELETE");
    },
    [post]
  );

  const setEmployerVerified = useCallback(
    async (userId: string, verified: boolean) => {
      await post(`/api/admin/employers/${userId}/verify`, { verified }, "PATCH");
    },
    [post]
  );

  const getWorkerReviews = useCallback(
    (workerId: string) => data.reviews.filter((r) => r.targetId === workerId),
    [data.reviews]
  );
  const getEmployerReviews = useCallback(
    (employerId: string) => data.reviews.filter((r) => r.targetId === employerId),
    [data.reviews]
  );

  const value = useMemo(
    () => ({
      ...data,
      loading,
      authStatus: status,
      needsOnboarding,
      currentUser,
      refresh,
      addJob,
      updateAvailability,
      updateCvSummary,
      saveWorkerProfile,
      saveEmployerProfile,
      addReview,
      getWorkerReviews,
      getEmployerReviews,
      deleteJob,
      deleteReview,
      deleteUser,
      setEmployerVerified,
    }),
    [
      data,
      loading,
      status,
      needsOnboarding,
      currentUser,
      refresh,
      addJob,
      updateAvailability,
      updateCvSummary,
      saveWorkerProfile,
      saveEmployerProfile,
      addReview,
      getWorkerReviews,
      getEmployerReviews,
      deleteJob,
      deleteReview,
      deleteUser,
      setEmployerVerified,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
