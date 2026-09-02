"use client";

import Link from "next/link";
import { useLogout } from "@/lib/auth-context";
import type { Role } from "@/types/auth";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  role: Role;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, open, onClose }: SidebarProps) {
  const handleLogout = useLogout();

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.open : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <nav className={styles.nav}>
          <Link href="/dashboard" onClick={onClose}>
            ダッシュボード
          </Link>
          <Link href="/study-records" onClick={onClose}>
            学習記録
          </Link>
          <Link href="/study-records/new" onClick={onClose}>
            学習記録登録
          </Link>

          {role === "ADMIN" && (
            <>
              <hr className={styles.divider} />
              <Link href="/admin/categories" onClick={onClose}>
                カテゴリ管理
              </Link>
              <Link href="/admin/users" onClick={onClose}>
                ユーザー管理
              </Link>
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
