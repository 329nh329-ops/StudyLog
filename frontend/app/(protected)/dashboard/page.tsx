"use client";

import { useEffect, useState } from "react";
import CategoryChart from "@/components/dashboard/CategoryChart";
import DailyChart from "@/components/dashboard/DailyChart";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import RecentRecords from "@/components/dashboard/RecentRecords";
import StreakCard from "@/components/dashboard/StreakCard";
import TodayStudyTime from "@/components/dashboard/TodayStudyTime";
import ErrorMessage from "@/components/common/ErrorMessage";
import { ApiError } from "@/lib/api";
import { useAuthUser } from "@/lib/auth-context";
import { getDashboard } from "@/lib/dashboard";
import type { Dashboard } from "@/types/dashboard";

export default function DashboardPage() {
  const user = useAuthUser();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDashboard()
      .then((data) => {
        if (cancelled) return;
        setDashboard(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "ダッシュボードの取得に失敗しました。");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>ようこそ、{user.username}さん</p>

      <a href="/study-records/new">学習記録を登録</a>

      {error && <ErrorMessage message={error} />}

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
    </div>
  );
}
