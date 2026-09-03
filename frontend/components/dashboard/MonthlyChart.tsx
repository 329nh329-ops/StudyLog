"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyTotal } from "@/types/dashboard";
import styles from "./ChartSection.module.css";

interface MonthlyChartProps {
  data: MonthlyTotal[];
}

const tooltipContentStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--color-text-primary)",
};

export default function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <section>
      <h2 className={styles.heading}>月別学習時間（直近6か月）</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" stroke="var(--color-text-secondary)" tick={{ fill: "var(--color-text-secondary)" }} />
          <YAxis stroke="var(--color-text-secondary)" tick={{ fill: "var(--color-text-secondary)" }} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Bar dataKey="minutes" name="学習時間（分）" fill="var(--color-accent)" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
