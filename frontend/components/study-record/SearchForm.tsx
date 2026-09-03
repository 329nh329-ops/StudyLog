"use client";

import { useEffect, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { toErrorMessage } from "@/lib/api";
import { listCategories } from "@/lib/category";
import type { Category } from "@/types/category";
import type { StudyRecordSearchParams } from "@/lib/study-record";
import styles from "./SearchForm.module.css";

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
    <form onSubmit={handleSubmit} className={styles.form}>
      {categoriesError && <ErrorMessage message={categoriesError} />}

      <div className={styles.grid}>
        <FormField label="キーワード" htmlFor="search-keyword">
          <input
            id="search-keyword"
            type="text"
            className={styles.input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </FormField>

        <FormField label="カテゴリ" htmlFor="search-category">
          <select
            id="search-category"
            className={styles.input}
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
        </FormField>

        <FormField label="理解度" htmlFor="search-understanding-level">
          <select
            id="search-understanding-level"
            className={styles.input}
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
        </FormField>

        <FormField label="学習日（開始）" htmlFor="search-date-from">
          <input
            id="search-date-from"
            type="date"
            className={styles.input}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </FormField>

        <FormField label="学習日（終了）" htmlFor="search-date-to">
          <input
            id="search-date-to"
            type="date"
            className={styles.input}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </FormField>
      </div>

      <div className={styles.actions}>
        <Button type="submit">検索</Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          リセット
        </Button>
      </div>
    </form>
  );
}
