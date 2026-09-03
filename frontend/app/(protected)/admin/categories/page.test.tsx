import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/category", () => ({
  listCategories: vi.fn(() => Promise.resolve([{ id: 1, name: "英語" }])),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

import AdminCategoriesPage from "./page";

describe("AdminCategoriesPage", () => {
  it("主要な情報が表示される", async () => {
    render(<AdminCategoriesPage />);

    expect(screen.getByRole("heading", { name: "カテゴリ管理" })).toBeInTheDocument();
    expect(screen.getByLabelText("カテゴリ名")).toBeInTheDocument();
    expect(await screen.findByText("英語")).toBeInTheDocument();
  });
});
