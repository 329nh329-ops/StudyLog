"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoryTotal } from "@/types/dashboard";
import styles from "./ChartSection.module.css";

interface CategoryChartProps {
  data: CategoryTotal[];
}

const tooltipContentStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--color-text-primary)",
};

export default function CategoryChart({ data }: CategoryChartProps) {
  return (
    <section>
      <h2 className={styles.heading}>カテゴリ別学習時間（今月）</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="category_name" stroke="var(--color-text-secondary)" tick={{ fill: "var(--color-text-secondary)" }} />
          <YAxis stroke="var(--color-text-secondary)" tick={{ fill: "var(--color-text-secondary)" }} />
          <Tooltip contentStyle={tooltipContentStyle} />
          <Bar dataKey="minutes" name="学習時間（分）" fill="var(--color-accent)" maxBarSize={55} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
