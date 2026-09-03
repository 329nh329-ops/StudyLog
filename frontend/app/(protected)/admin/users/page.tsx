"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ErrorMessage from "@/components/common/ErrorMessage";
import buttonStyles from "@/components/ui/Button.module.css";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { toErrorMessage } from "@/lib/api";
import { listUsers } from "@/lib/admin";
import type { User } from "@/types/auth";
import styles from "./page.module.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(toErrorMessage(e, "ユーザー一覧の取得に失敗しました。"));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="ユーザー一覧" />

      {error && <ErrorMessage message={error} />}

      <Card className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ユーザー名</th>
              <th>権限</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <Link
                    href={`/admin/users/${user.id}/study-records`}
                    className={`${buttonStyles.secondary} ${styles.viewButton}`}
                  >
                    学習記録を見る
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
