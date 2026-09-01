"use client";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

const STAR_VALUES = [1, 2, 3, 4, 5];

export default function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div role="radiogroup" aria-label="理解度">
      {STAR_VALUES.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`理解度${star}`}
          onClick={() => onChange(star)}
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
