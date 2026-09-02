"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import type { User } from "@/types/auth";
import styles from "./Layout.module.css";

interface LayoutProps {
  user: User;
  children: ReactNode;
}

export default function Layout({ user, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <Header username={user.username} onMenuToggle={() => setSidebarOpen((open) => !open)} />
      <div className={styles.body}>
        <Sidebar role={user.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
