"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CategoryChart from "@/components/dashboard/CategoryChart";
import DailyChart from "@/components/dashboard/DailyChart";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import RecentRecords from "@/components/dashboard/RecentRecords";
import StreakCard from "@/components/dashboard/StreakCard";
import TodayStudyTime from "@/components/dashboard/TodayStudyTime";
import ErrorMessage from "@/components/common/ErrorMessage";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { toErrorMessage } from "@/lib/api";
import { useAuthUser } from "@/lib/auth-context";
import { getDashboard } from "@/lib/dashboard";
import type { Dashboard } from "@/types/dashboard";
import styles from "./page.module.css";

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
        setError(toErrorMessage(e, "ダッシュボードの取得に失敗しました。"));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        description={`ようこそ、${user.username}さん`}
        action={<Link href="/study-records/new">学習記録を登録</Link>}
      />

      {error && <ErrorMessage message={error} />}

      {dashboard && (
        <>
          <div className={styles.summaryGrid}>
            <Card>
              <TodayStudyTime minutes={dashboard.today_minutes} />
            </Card>
            <Card>
              <StreakCard days={dashboard.streak_days} />
            </Card>
          </div>

          <div className={styles.chartGrid}>
            <Card>
              <DailyChart data={dashboard.daily_totals} />
            </Card>
            <Card>
              <CategoryChart data={dashboard.category_totals} />
            </Card>
          </div>

          <Card className={styles.fullWidth}>
            <MonthlyChart data={dashboard.monthly_totals} />
          </Card>

          <Card>
            <RecentRecords records={dashboard.recent_records} />
          </Card>
        </>
      )}
    </div>
  );
}
