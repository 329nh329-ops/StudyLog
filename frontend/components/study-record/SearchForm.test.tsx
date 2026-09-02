import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchForm from "./SearchForm";
import { listCategories } from "@/lib/category";
import type { Category } from "@/types/category";

vi.mock("@/lib/category", () => ({
  listCategories: vi.fn(),
}));

const mockedListCategories = vi.mocked(listCategories);

const categories: Category[] = [
  { id: 1, name: "Java", created_at: "2026-01-01T00:00:00", updated_at: "2026-01-01T00:00:00" },
  { id: 2, name: "Python", created_at: "2026-01-01T00:00:00", updated_at: "2026-01-01T00:00:00" },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SearchForm", () => {
  it("マウント時にカテゴリ一覧を取得し選択肢として表示する", async () => {
    mockedListCategories.mockResolvedValue(categories);

    render(<SearchForm onSearch={vi.fn()} />);

    expect(await screen.findByRole("option", { name: "Java" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Python" })).toBeInTheDocument();
  });

  it("カテゴリ取得に失敗した場合エラーメッセージを表示する", async () => {
    mockedListCategories.mockRejectedValue(new Error("network error"));

    render(<SearchForm onSearch={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "カテゴリ一覧の取得に失敗しました。",
    );
  });

  it("キーワードのみ入力して検索すると他項目はundefinedでonSearchが呼ばれる", async () => {
    mockedListCategories.mockResolvedValue(categories);
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchForm onSearch={handleSearch} />);
    await waitFor(() => expect(mockedListCategories).toHaveBeenCalled());

    await user.type(screen.getByLabelText("キーワード"), "Spring");
    await user.click(screen.getByRole("button", { name: "検索" }));

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith({
      keyword: "Spring",
      category_id: undefined,
      understanding_level: undefined,
      from: undefined,
      to: undefined,
    });
  });

  it("全項目を入力して検索すると入力した値でonSearchが呼ばれる", async () => {
    mockedListCategories.mockResolvedValue(categories);
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchForm onSearch={handleSearch} />);
    await screen.findByRole("option", { name: "Java" });

    await user.type(screen.getByLabelText("キーワード"), "テスト");
    await user.selectOptions(screen.getByLabelText("カテゴリ"), "1");
    await user.selectOptions(screen.getByLabelText("理解度"), "4");
    await user.type(screen.getByLabelText("学習日（開始）"), "2026-01-01");
    await user.type(screen.getByLabelText("学習日（終了）"), "2026-01-31");
    await user.click(screen.getByRole("button", { name: "検索" }));

    expect(handleSearch).toHaveBeenCalledWith({
      keyword: "テスト",
      category_id: 1,
      understanding_level: 4,
      from: "2026-01-01",
      to: "2026-01-31",
    });
  });

  it("リセットボタンで入力項目がクリアされonSearch({})が呼ばれる", async () => {
    mockedListCategories.mockResolvedValue(categories);
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchForm onSearch={handleSearch} />);
    await screen.findByRole("option", { name: "Java" });

    const keywordInput = screen.getByLabelText("キーワード") as HTMLInputElement;
    await user.type(keywordInput, "テスト");
    await user.selectOptions(screen.getByLabelText("カテゴリ"), "1");

    await user.click(screen.getByRole("button", { name: "リセット" }));

    expect(keywordInput.value).toBe("");
    expect(handleSearch).toHaveBeenCalledWith({});
  });
});
