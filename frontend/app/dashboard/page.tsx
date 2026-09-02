"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryChart from "@/components/dashboard/CategoryChart";
import DailyChart from "@/components/dashboard/DailyChart";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import RecentRecords from "@/components/dashboard/RecentRecords";
import StreakCard from "@/components/dashboard/StreakCard";
import TodayStudyTime from "@/components/dashboard/TodayStudyTime";
import { ApiError } from "@/lib/api";
import { getCurrentUser, logout } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";
import type { User } from "@/types/auth";
import type { Dashboard } from "@/types/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser().then((currentUser) => {
      if (cancelled) return;
      if (currentUser === null) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      getDashboard()
        .then((data) => {
          if (cancelled) return;
          setDashboard(data);
        })
        .catch((e) => {
          if (cancelled) return;
          setError(e instanceof ApiError ? e.message : "ダッシュボードの取得に失敗しました。");
        });
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (user === null) {
    return null;
  }

  return (
    <main>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{user.username}さん</p>
      <button type="button" onClick={handleLogout}>
        ログアウト
      </button>

      <a href="/study-records/new">学習記録を登録</a>

      {error && <p role="alert">{error}</p>}

      {dashboard && (
        <>
          <TodayStudyTime minutes={dashboard.today_minutes} />
          <StreakCard days={dashboard.streak_days} />
          <DailyChart data={dashboard.daily_totals} />
          <CategoryChart data={dashboard.category_totals} />
          <MonthlyChart data={dashboard.monthly_totals} />
          <RecentRecords records={dashboard.recent_records} />
        </>
      )}
    </main>
  );
}
