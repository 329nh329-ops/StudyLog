"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoryTotal } from "@/types/dashboard";

interface CategoryChartProps {
  data: CategoryTotal[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  return (
    <section>
      <h2>カテゴリ別学習時間（今月）</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category_name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="minutes" name="学習時間（分）" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
