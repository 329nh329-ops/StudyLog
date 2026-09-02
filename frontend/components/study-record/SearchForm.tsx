"use client";

import { useEffect, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import { toErrorMessage } from "@/lib/api";
import { listCategories } from "@/lib/category";
import type { Category } from "@/types/category";
import type { StudyRecordSearchParams } from "@/lib/study-record";

interface SearchFormProps {
  onSearch: (params: StudyRecordSearchParams) => void;
}

const UNDERSTANDING_LEVELS = [1, 2, 3, 4, 5];

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [understandingLevel, setUnderstandingLevel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((e) => {
        setCategoriesError(
          toErrorMessage(e, "カテゴリ一覧の取得に失敗しました。"),
        );
      });
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSearch({
      keyword: keyword || undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
      understanding_level: understandingLevel ? Number(understandingLevel) : undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
    });
  }

  function handleReset() {
    setKeyword("");
    setCategoryId("");
    setUnderstandingLevel("");
    setDateFrom("");
    setDateTo("");
    onSearch({});
  }

  return (
    <form onSubmit={handleSubmit}>
      {categoriesError && <ErrorMessage message={categoriesError} />}

      <div>
        <label htmlFor="search-keyword">キーワード</label>
        <input
          id="search-keyword"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="search-category">カテゴリ</label>
        <select
          id="search-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">すべて</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="search-understanding-level">理解度</label>
        <select
          id="search-understanding-level"
          value={understandingLevel}
          onChange={(e) => setUnderstandingLevel(e.target.value)}
        >
          <option value="">すべて</option>
          {UNDERSTANDING_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="search-date-from">学習日（開始）</label>
        <input
          id="search-date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="search-date-to">学習日（終了）</label>
        <input
          id="search-date-to"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      <button type="submit">検索</button>
      <button type="button" onClick={handleReset}>
        リセット
      </button>
    </form>
  );
}
