import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

vi.mock("@/lib/study-record", () => ({
  listStudyRecords: vi.fn(() =>
    Promise.resolve({ items: [record], page: 1, page_size: 10, total: 1, total_pages: 1 }),
  ),
  deleteStudyRecord: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/category", () => ({
  listCategories: vi.fn(() => Promise.resolve([])),
}));

import StudyRecordsPage from "./page";

describe("StudyRecordsPage", () => {
  it("主要な情報が表示される", async () => {
    render(<StudyRecordsPage />);

    expect(screen.getByRole("heading", { name: "学習記録一覧" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "学習記録を登録" })).toHaveAttribute(
      "href",
      "/study-records/new",
    );
    expect(await screen.findByText("単語帳")).toBeInTheDocument();
  });
});
