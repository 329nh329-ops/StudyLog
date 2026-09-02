import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("totalPagesが1以下のとき何も表示しない", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("totalPagesが0のとき何も表示しない", () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("先頭ページでは「前へ」が無効化される", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "前へ" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
  });

  it("最終ページでは「次へ」が無効化される", () => {
    render(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "前へ" })).toBeEnabled();
  });

  it("中間ページでは両方のボタンが有効", () => {
    render(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "前へ" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
  });

  it("現在のページ数を表示する", () => {
    render(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("「次へ」クリックでonPageChangeがpage+1で呼ばれる", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "次へ" }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("「前へ」クリックでonPageChangeがpage-1で呼ばれる", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "前へ" }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
