"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/common/Pagination";
import ErrorMessage from "@/components/common/ErrorMessage";
import SearchForm from "@/components/study-record/SearchForm";
import { ApiError } from "@/lib/api";
import {
  deleteStudyRecord,
  listStudyRecords,
  type StudyRecordSearchParams,
} from "@/lib/study-record";
import { understandingLevelStars } from "@/lib/understanding-level";
import type { StudyRecord } from "@/types/study-record";

export default function StudyRecordsPage() {
  const [searchParams, setSearchParams] = useState<StudyRecordSearchParams>({});
  const [page, setPage] = useState(1);

  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    listStudyRecords({ ...searchParams, page })
      .then((result) => {
        if (cancelled) return;
        setRecords(result.items);
        setTotalPages(result.total_pages);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "学習記録の取得に失敗しました。");
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, page, reloadCount]);

  function reload() {
    setReloadCount((count) => count + 1);
  }

  function handleSearch(params: StudyRecordSearchParams) {
    setSearchParams(params);
    setPage(1);
  }

  async function handleDelete(record: StudyRecord) {
    if (!window.confirm("この学習記録を削除しますか？")) {
      return;
    }
    try {
      await deleteStudyRecord(record.id);
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "学習記録の削除に失敗しました。");
    }
  }

  return (
    <div>
      <h1>学習記録一覧</h1>

      <Link href="/study-records/new">学習記録を登録</Link>

      <SearchForm onSearch={handleSearch} />

      {error && <ErrorMessage message={error} />}

      <table>
        <thead>
          <tr>
            <th>学習日</th>
            <th>カテゴリ</th>
            <th>タイトル</th>
            <th>学習時間</th>
            <th>理解度</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.study_date}</td>
              <td>{record.category_name}</td>
              <td>{record.title}</td>
              <td>{record.study_minutes}分</td>
              <td>{understandingLevelStars(record.understanding_level)}</td>
              <td>
                <Link href={`/study-records/${record.id}/edit`}>編集</Link>
                <button type="button" onClick={() => handleDelete(record)}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
