"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyTotal } from "@/types/dashboard";

interface DailyChartProps {
  data: DailyTotal[];
}

export default function DailyChart({ data }: DailyChartProps) {
  return (
    <section>
      <h2>日別学習時間（直近7日間）</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="minutes" name="学習時間（分）" stroke="#4f46e5" />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
