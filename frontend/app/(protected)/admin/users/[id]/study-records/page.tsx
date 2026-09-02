"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SearchForm from "@/components/study-record/SearchForm";
import Pagination from "@/components/common/Pagination";
import ErrorMessage from "@/components/common/ErrorMessage";
import { toErrorMessage } from "@/lib/api";
import { getUserStudyRecords, listUsers } from "@/lib/admin";
import type { StudyRecordSearchParams } from "@/lib/study-record";
import { understandingLevelStars } from "@/lib/understanding-level";
import type { StudyRecord } from "@/types/study-record";
import type { User } from "@/types/auth";

export default function AdminUserStudyRecordsPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  const [targetUser, setTargetUser] = useState<User | null>(null);

  const [searchParams, setSearchParams] = useState<StudyRecordSearchParams>({});
  const [page, setPage] = useState(1);

  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listUsers()
      .then((users) => {
        if (cancelled) return;
        setTargetUser(users.find((u) => u.id === userId) ?? null);
      })
      .catch(() => {
        /* ユーザー名表示は補助情報のため、失敗しても一覧の取得は継続する */
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    getUserStudyRecords(userId, { ...searchParams, page })
      .then((result) => {
        if (cancelled) return;
        setRecords(result.items);
        setTotalPages(result.total_pages);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(toErrorMessage(e, "学習記録の取得に失敗しました。"));
      });

    return () => {
      cancelled = true;
    };
  }, [userId, searchParams, page]);

  function handleSearch(params: StudyRecordSearchParams) {
    setSearchParams(params);
    setPage(1);
  }

  return (
    <div>
      <h1>{targetUser ? `${targetUser.username} さんの学習記録` : "学習記録"}</h1>

      <Link href="/admin/users">ユーザー一覧に戻る</Link>

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
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
