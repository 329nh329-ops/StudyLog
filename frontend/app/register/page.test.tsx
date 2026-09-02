import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

import RegisterPage from "./page";

describe("RegisterPage", () => {
  it("登録画面の主要な要素が表示される", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("heading", { name: "ユーザー登録" })).toBeInTheDocument();
    expect(screen.getByLabelText("ユーザー名")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード確認")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登録する" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログインはこちら" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
