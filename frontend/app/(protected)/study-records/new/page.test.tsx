import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/study-record", () => ({
  createStudyRecord: vi.fn(),
}));

vi.mock("@/lib/category", () => ({
  listCategories: vi.fn(() => Promise.resolve([])),
}));

import NewStudyRecordPage from "./page";

describe("NewStudyRecordPage", () => {
  it("フォームの主要な要素が表示される", () => {
    render(<NewStudyRecordPage />);

    expect(screen.getByRole("heading", { name: "学習記録登録" })).toBeInTheDocument();
    expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
    expect(screen.getByLabelText("学習内容")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "理解度" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登録する" })).toBeInTheDocument();
  });
});
