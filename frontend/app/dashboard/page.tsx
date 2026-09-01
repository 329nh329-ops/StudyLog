"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/auth";
import type { User } from "@/types/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser().then((currentUser) => {
      if (cancelled) return;
      if (currentUser === null) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (loading || user === null) {
    return null;
  }

  return (
    <main>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{user.username}さん</p>
      <button type="button" onClick={handleLogout}>
        ログアウト
      </button>
    </main>
  );
}
