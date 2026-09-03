import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: "1" }),
}));

const record = {
  category_id: 1,
  title: "単語帳",
  content: "content",
  understanding_level: 3,
  study_minutes: 30,
  study_date: "2026-09-01",
};

vi.mock("@/lib/study-record", () => ({
  getStudyRecord: vi.fn(() => Promise.resolve(record)),
  updateStudyRecord: vi.fn(),
}));

vi.mock("@/lib/category", () => ({
  listCategories: vi.fn(() => Promise.resolve([])),
}));

import EditStudyRecordPage from "./page";

describe("EditStudyRecordPage", () => {
  it("フォームの主要な要素が表示される", async () => {
    render(<EditStudyRecordPage />);

    expect(await screen.findByRole("heading", { name: "学習記録編集" })).toBeInTheDocument();
    expect(await screen.findByDisplayValue("単語帳")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "更新する" })).toBeInTheDocument();
  });
});
