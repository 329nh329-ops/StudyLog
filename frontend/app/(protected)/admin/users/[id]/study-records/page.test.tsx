import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
}));

const record = {
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
};

vi.mock("@/lib/admin", () => ({
  getUser: vi.fn(() => Promise.resolve({ id: 1, username: "testuser", role: "USER" })),
  getUserStudyRecords: vi.fn(() =>
    Promise.resolve({ items: [record], page: 1, page_size: 10, total: 1, total_pages: 1 }),
  ),
}));

vi.mock("@/lib/category", () => ({
  listCategories: vi.fn(() => Promise.resolve([])),
}));

import AdminUserStudyRecordsPage from "./page";

describe("AdminUserStudyRecordsPage", () => {
  it("主要な情報が表示される", async () => {
    render(<AdminUserStudyRecordsPage />);

    expect(
      await screen.findByRole("heading", { name: "testuser さんの学習記録" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ユーザー一覧に戻る" })).toHaveAttribute(
      "href",
      "/admin/users",
    );
    expect(await screen.findByText("単語帳")).toBeInTheDocument();
  });
});
