import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/admin", () => ({
  listUsers: vi.fn(() =>
    Promise.resolve([{ id: 1, username: "testuser", role: "USER" }]),
  ),
}));

import AdminUsersPage from "./page";

describe("AdminUsersPage", () => {
  it("主要な情報が表示される", async () => {
    render(<AdminUsersPage />);

    expect(screen.getByRole("heading", { name: "ユーザー一覧" })).toBeInTheDocument();
    expect(await screen.findByText("testuser")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "学習記録を見る" }),
    ).toHaveAttribute("href", "/admin/users/1/study-records");
  });
});
