import styles from "./SummaryCard.module.css";

interface StreakCardProps {
  days: number;
}

export default function StreakCard({ days }: StreakCardProps) {
  return (
    <section>
      <h2 className={styles.label}>🔥 連続学習</h2>
      <p className={styles.value}>{days}日</p>
    </section>
  );
}
