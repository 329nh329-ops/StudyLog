import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PageHeader from "./PageHeader";

describe("PageHeader", () => {
  it("titleが表示される", () => {
    render(<PageHeader title="ダッシュボード" />);
    expect(screen.getByRole("heading", { name: "ダッシュボード" })).toBeInTheDocument();
  });

  it("descriptionを指定すると表示される", () => {
    render(<PageHeader title="ダッシュボード" description="学習状況の概要" />);
    expect(screen.getByText("学習状況の概要")).toBeInTheDocument();
  });

  it("descriptionを指定しない場合は表示されない", () => {
    const { container } = render(<PageHeader title="ダッシュボード" />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("actionを指定すると表示される", () => {
    render(<PageHeader title="ダッシュボード" action={<button>登録</button>} />);
    expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
  });

  it("actionを指定しない場合は表示されない", () => {
    render(<PageHeader title="ダッシュボード" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
