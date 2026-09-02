"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import Loading from "@/components/common/Loading";
import { useAuthUser } from "@/lib/auth-context";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthUser();

  useEffect(() => {
    if (user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user.role !== "ADMIN") {
    return <Loading />;
  }

  return <>{children}</>;
}
