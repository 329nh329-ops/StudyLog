"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import type { Role } from "@/types/auth";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  role: Role;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, open, onClose }: SidebarProps) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.open : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <nav className={styles.nav}>
          <a href="/dashboard" onClick={onClose}>
            ダッシュボード
          </a>
          <a href="/study-records" onClick={onClose}>
            学習記録
          </a>
          <a href="/study-records/new" onClick={onClose}>
            学習記録登録
          </a>

          {role === "ADMIN" && (
            <>
              <hr className={styles.divider} />
              <a href="/admin/categories" onClick={onClose}>
                カテゴリ管理
              </a>
              <a href="/admin/users" onClick={onClose}>
                ユーザー管理
              </a>
            </>
          )}

          <hr className={styles.divider} />
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            ログアウト
          </button>
        </nav>
      </aside>
    </>
  );
}
