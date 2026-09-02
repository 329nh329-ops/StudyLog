"use client";

import { useState } from "react";
import { useLogout } from "@/lib/auth-context";
import styles from "./Header.module.css";

interface HeaderProps {
  username: string;
  onMenuToggle: () => void;
}

export default function Header({ username, onMenuToggle }: HeaderProps) {
  const handleLogout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

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
