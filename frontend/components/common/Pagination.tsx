"use client";

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
    <nav aria-label="ページネーション">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        前へ
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        次へ
      </button>
    </nav>
  );
}
