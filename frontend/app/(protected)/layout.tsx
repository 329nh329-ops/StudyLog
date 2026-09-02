"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import Layout from "@/components/layout/Layout";
import Loading from "@/components/common/Loading";
import { getCurrentUser } from "@/lib/auth";
import { AuthProvider } from "@/lib/auth-context";
import type { User } from "@/types/auth";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser().then((currentUser) => {
      if (cancelled) return;
      if (currentUser === null) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setChecked(true);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!checked || user === null) {
    return <Loading />;
  }

  return (
    <AuthProvider value={user}>
      <Layout user={user}>{children}</Layout>
    </AuthProvider>
  );
}
