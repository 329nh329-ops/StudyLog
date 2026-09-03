import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/auth-context", () => ({
  useAuthUser: () => ({ id: 1, username: "testuser", role: "USER" }),
}));

const dashboardData = {
  today_minutes: 30,
  streak_days: 5,
  daily_totals: [{ date: "2026-09-01", minutes: 30 }],
  category_totals: [{ category_id: 1, category_name: "英語", minutes: 30 }],
  monthly_totals: [{ month: "2026-09", minutes: 30 }],
  recent_records: [
    {
      id: 1,
      category_id: 1,
      category_name: "英語",
      title: "単語帳",
      content: "content",
      understanding_level: 3,
      study_minutes: 30,
      study_date: "2026-09-01",
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    },
  ],
};

vi.mock("@/lib/dashboard", () => ({
  getDashboard: vi.fn(() => Promise.resolve(dashboardData)),
}));

import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("主要な情報が表示される", async () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { name: "ダッシュボード" })).toBeInTheDocument();
    const todayMinutes = await screen.findAllByText(
      (_, element) => element?.textContent === "30分",
    );
    expect(todayMinutes.length).toBeGreaterThan(0);

    const streakDays = screen.getAllByText((_, element) => element?.textContent === "5日");
    expect(streakDays.length).toBeGreaterThan(0);
    expect(screen.getByText("単語帳")).toBeInTheDocument();
  });
});
