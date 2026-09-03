"use client";

import styles from "./StarRating.module.css";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

const STAR_VALUES = [1, 2, 3, 4, 5];

export default function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div role="radiogroup" aria-label="理解度" className={styles.group}>
      {STAR_VALUES.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`理解度${star}`}
          onClick={() => onChange(star)}
          className={`${styles.star} ${star <= value ? styles.starActive : ""}`}
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
