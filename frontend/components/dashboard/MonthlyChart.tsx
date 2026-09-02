"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyTotal } from "@/types/dashboard";

interface MonthlyChartProps {
  data: MonthlyTotal[];
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <section>
      <h2>月別学習時間（直近6か月）</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" name="学習時間（分）" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
