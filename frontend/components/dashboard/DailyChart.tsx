"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyTotal } from "@/types/dashboard";
import styles from "./ChartSection.module.css";

interface DailyChartProps {
  data: DailyTotal[];
}

const tooltipContentStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--color-text-primary)",
};

export default function DailyChart({ data }: DailyChartProps) {
  return (
    <section>
      <h2 className={styles.heading}>日別学習時間（直近7日間）</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" stroke="var(--color-text-secondary)" tick={{ fill: "var(--color-text-secondary)" }} />
          <YAxis stroke="var(--color-text-secondary)" tick={{ fill: "var(--color-text-secondary)" }} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Line type="monotone" dataKey="minutes" name="学習時間（分）" stroke="var(--color-accent)" />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
