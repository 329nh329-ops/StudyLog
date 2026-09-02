"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { listUsers } from "@/lib/admin";
import type { User } from "@/types/auth";

export default function AdminUsersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser().then((user) => {
      if (cancelled) return;
      if (user === null) {
        router.push("/login");
        return;
      }
      if (user.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      setAuthorized(true);

      listUsers()
        .then((data) => {
          if (cancelled) return;
          setUsers(data);
        })
        .catch((e) => {
          if (cancelled) return;
          setError(e instanceof ApiError ? e.message : "ユーザー一覧の取得に失敗しました。");
        });
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!authorized) {
    return null;
  }

  return (
    <main>
      <h1>ユーザー一覧</h1>

      {error && <p role="alert">{error}</p>}

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
    </main>
  );
}
