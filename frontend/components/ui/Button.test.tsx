import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button", () => {
  it("デフォルトではprimaryのクラスが適用される", () => {
    render(<Button>送信</Button>);
    expect(screen.getByRole("button", { name: "送信" }).className).toMatch(/primary/);
  });

  it("variantを指定するとそのクラスが適用される", () => {
    render(<Button variant="danger">削除</Button>);
    expect(screen.getByRole("button", { name: "削除" }).className).toMatch(/danger/);
  });

  it("disabled指定時は無効化される", () => {
    render(<Button disabled>保存</Button>);
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });

  it("クリックするとonClickが呼ばれる", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>実行</Button>);

    await user.click(screen.getByRole("button", { name: "実行" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
