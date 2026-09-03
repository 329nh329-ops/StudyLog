"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/common/Pagination";
import ErrorMessage from "@/components/common/ErrorMessage";
import SearchForm from "@/components/study-record/SearchForm";
import Button from "@/components/ui/Button";
import buttonStyles from "@/components/ui/Button.module.css";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { toErrorMessage } from "@/lib/api";
import {
  deleteStudyRecord,
  listStudyRecords,
  type StudyRecordSearchParams,
} from "@/lib/study-record";
import { understandingLevelStars } from "@/lib/understanding-level";
import type { StudyRecord } from "@/types/study-record";
import styles from "./page.module.css";

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
        setError(toErrorMessage(e, "学習記録の取得に失敗しました。"));
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
      setError(toErrorMessage(e, "学習記録の削除に失敗しました。"));
    }
  }

  return (
    <div>
      <PageHeader
        title="学習記録一覧"
        action={
          <Link
            href="/study-records/new"
            className={`${buttonStyles.primary} ${styles.registerButton}`}
          >
            ＋ 学習記録を登録
          </Link>
        }
      />

      <Card className={styles.searchCard}>
        <SearchForm onSearch={handleSearch} />
      </Card>

      {error && <ErrorMessage message={error} />}

      <Card className={styles.tableCard}>
        <table className={styles.table}>
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
                  <div className={styles.actions}>
                    <Link href={`/study-records/${record.id}/edit`} className={styles.editLink}>
                      編集
                    </Link>
                    <Button type="button" variant="danger" onClick={() => handleDelete(record)}>
                      削除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
