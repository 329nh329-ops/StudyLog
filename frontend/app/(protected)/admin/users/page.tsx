"use client";

import { useEffect, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import { ApiError } from "@/lib/api";
import { listUsers } from "@/lib/admin";
import type { User } from "@/types/auth";

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
        setError(e instanceof ApiError ? e.message : "ユーザー一覧の取得に失敗しました。");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1>ユーザー一覧</h1>

      {error && <ErrorMessage message={error} />}

      <table>
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
                <a href={`/admin/users/${user.id}/study-records`}>学習記録を見る</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
