"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import styles from "./Header.module.css";

interface HeaderProps {
  username: string;
  onMenuToggle: () => void;
}

export default function Header({ username, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onMenuToggle}
          aria-label="メニューを開閉"
        >
          ☰
        </button>
        <span className={styles.logo}>StudyLog</span>
      </div>

      <div className={styles.userMenu}>
        <button
          type="button"
          className={styles.userButton}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {username} ▼
        </button>
        {menuOpen && (
          <div className={styles.dropdown}>
            <button type="button" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
