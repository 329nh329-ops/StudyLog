"use client";

import Button from "@/components/ui/Button";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="ページネーション" className={styles.nav}>
      <Button
        type="button"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        前へ
      </Button>
      <span className={styles.status}>
        {page} / {totalPages}
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        次へ
      </Button>
    </nav>
  );
}
