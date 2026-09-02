interface StreakCardProps {
  days: number;
}

export default function StreakCard({ days }: StreakCardProps) {
  return (
    <section>
      <h2>🔥 連続学習</h2>
      <p>{days}日</p>
    </section>
  );
}
